require('dotenv').config()
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')
const fs = require('fs')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth')
const publicRoutes = require('./routes/public')
const uploadRoutes = require('./routes/upload')
const prisma = require('./prisma')
const { sanitize } = require('./utils')
const cookieParser = require('cookie-parser')

// Ensure local uploads directory exists (fallback; new uploads go to Cloudinary)
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const app = express()
const port = process.env.PORT || 4000
const isProduction = process.env.NODE_ENV === 'production'
const jwtSecret = process.env.JWT_SECRET || ''
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',').map((value) => value.trim().replace(/\/$/, '')).filter(Boolean)

const knownJwtPlaceholders = new Set([
  'change-this-secret-before-production',
  'replace-with-a-unique-random-secret-at-least-32-characters',
])
if (!jwtSecret || knownJwtPlaceholders.has(jwtSecret)) {
  throw new Error('JWT_SECRET must be a unique random value.')
}
if (isProduction && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.')
}
if (isProduction && !process.env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS environment variable is required in production.')
}

const trustProxy = process.env.TRUST_PROXY || ''
app.set('trust proxy', /^[1-9]\d*$/.test(trustProxy) ? Number(trustProxy) : false)

// Security headers. CSP is relaxed for images/iframes because:
//   - Product images are served from /uploads (same origin) and may also live on a CDN later.
//   - The contact section embeds Google Maps via <iframe>.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      'connect-src': ["'self'", 'https:'],
      'script-src': ["'self'", "'unsafe-inline'"], // Vite injects inline runtime; tighten when bundle-only.
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CDN to fetch /uploads
}))

app.use(compression())

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true)
    const error = new Error('Origin không được CORS cho phép.')
    error.status = 403
    callback(error)
  },
}))
app.use(cookieParser())
app.use(express.json({ limit: '2mb' }))
app.use((req, res, next) => { if (req.body && typeof req.body === 'object') req.body = sanitize(req.body); next() })

// Health endpoint also pings the DB so load balancers can detect a broken connection.
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true, db: 'up' })
  } catch (error) {
    res.status(503).json({ ok: false, db: 'down' })
  }
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)

// Unknown API paths must stay JSON; production SPA handles every other route.
app.use('/api', (req, res) => res.status(404).json({ message: 'Không tìm thấy API.' }))

// Serve SPA build in production
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(distPath))
  app.use((req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy đường dẫn.' }))
}
app.use((error, req, res, next) => {
  console.error('[ERROR]', error.name, error.message, error.code || '')
  if (error.name === 'PrismaClientInitializationError') {
    return res.status(503).json({ message: 'Không kết nối được MySQL. Vui lòng kiểm tra DATABASE_URL và đảm bảo database server đang chạy.' })
  }
  if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Dữ liệu đã tồn tại, vui lòng kiểm tra slug hoặc email.' })
    if (error.code === 'P2003') return res.status(409).json({ message: 'Không thể xóa dữ liệu đang được sử dụng.' })
    if (error.code === 'P2025') return res.status(404).json({ message: 'Không tìm thấy dữ liệu.' })
    return res.status(500).json({ message: 'Lỗi database. Vui lòng thử lại.' })
  }
  if (error.name === 'MulterError') {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Ảnh vượt quá dung lượng tối đa 10 MB.'
      : `Lỗi upload: ${error.message}`
    return res.status(400).json({ message })
  }
  if (error.message?.startsWith('Chỉ cho phép upload ảnh')) {
    return res.status(400).json({ message: error.message })
  }
  const status = error.status || error.statusCode || 500
  const message = status >= 500 ? 'Có lỗi xảy ra, vui lòng thử lại.' : error.message
  res.status(status).json({ message })
})

const server = app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`)
})

// Graceful shutdown: stop accepting connections, then disconnect Prisma so deploys
// don't leave half-open DB connections.
async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`)
  server.close(async () => {
    try {
      await prisma.$disconnect()
      console.log('Prisma disconnected. Bye.')
      process.exit(0)
    } catch (error) {
      console.error('Error during shutdown:', error)
      process.exit(1)
    }
  })
  // Force exit if shutdown hangs (e.g. open keep-alive sockets)
  setTimeout(() => { console.error('Force exit'); process.exit(1) }, 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

