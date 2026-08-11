const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required.')

const TOKEN_COOKIE = 'xenang_token'
const SENSITIVE_KEYS = /password|token|secret|authorization|cookie/i

/** Verify token from Authorization header or cookie */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const cookie = req.cookies?.[TOKEN_COOKIE]
  const token = header.startsWith('Bearer ') ? header.slice(7) : cookie
  if (!token) return res.status(401).json({ message: 'Bạn cần đăng nhập để tiếp tục.' })

  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' })
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (!user) return res.status(401).json({ message: 'Phiên đăng nhập không còn hiệu lực.' })
    if (user.role !== 'ADMIN') return res.status(403).json({ message: 'Bạn không có quyền truy cập.' })
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

/** Helper to create audit log entry */
async function auditLog({ userId, userEmail, action, entity, entityId, details, ip }) {
  try {
    await prisma.auditLog.create({
      data: { userId, userEmail, action, entity, entityId, details, ip }
    })
  } catch (err) {
    console.error('[AUDIT_LOG_ERROR]', err.message)
  }
}

function redactSensitive(value) {
  if (Array.isArray(value)) return value.map(redactSensitive)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.test(key) ? '[REDACTED]' : redactSensitive(item),
    ]))
  }
  return value
}

/** Audit successful CRUD responses, including DELETE routes returning 204. */
function auditMiddleware(entity, extractId) {
  return (req, res, next) => {
    res.once('finish', () => {
      if (res.statusCode >= 400 || !req.user) return
      const action = req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : req.method === 'DELETE' ? 'DELETE' : null
      if (!action) return

      const entityId = extractId ? extractId(req, res.locals.responseBody) : req.params.id || res.locals.responseBody?.id
      const details = req.method === 'DELETE' ? null : JSON.stringify(redactSensitive(req.body)).slice(0, 500)
      void auditLog({
        userId: req.user.id,
        userEmail: req.user.email,
        action,
        entity,
        entityId: entityId || null,
        details,
        ip: req.ip || '',
      })
    })

    const originalJson = res.json.bind(res)
    res.json = (body) => {
      res.locals.responseBody = body
      return originalJson(body)
    }
    next()
  }
}

module.exports = { requireAuth, auditLog, auditMiddleware, redactSensitive, TOKEN_COOKIE }
