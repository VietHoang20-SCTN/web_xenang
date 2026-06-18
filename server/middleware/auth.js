const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required.')

const TOKEN_COOKIE = 'xenang_token'

/** Verify token from Authorization header or cookie */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const cookie = req.cookies?.[TOKEN_COOKIE]
  const token = header.startsWith('Bearer ') ? header.slice(7) : cookie
  if (!token) return res.status(401).json({ message: 'Bạn cần đăng nhập để tiếp tục.' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' })
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

/** Middleware to automatically audit CRUD actions by method + entity */
function auditMiddleware(entity, extractId) {
  return (req, res, next) => {
    // Only audit after response is sent
    const originalSend = res.json.bind(res)
    res.json = function (body) {
      if (req.method !== 'GET' && req.user) {
        const action = req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : req.method === 'DELETE' ? 'DELETE' : null
        if (action) {
          const entityId = extractId ? extractId(req, body) : req.params.id || body?.id
          auditLog({
            userId: req.user.id,
            userEmail: req.user.email,
            action,
            entity,
            entityId: entityId || null,
            details: req.method === 'DELETE' ? null : JSON.stringify(req.body).slice(0, 500),
            ip: req.ip || req.headers['x-forwarded-for'] || ''
          })
        }
      }
      return originalSend(body)
    }
    next()
  }
}

module.exports = { requireAuth, auditLog, auditMiddleware, TOKEN_COOKIE }
