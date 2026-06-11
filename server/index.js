require('dotenv').config()
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth')
const publicRoutes = require('./routes/public')
const uploadRoutes = require('./routes/upload')
const prisma = require('./prisma')
const { sanitize } = require('./utils')

const app = express()
const port = process.env.PORT || 4000

// Required when deployed behind a reverse proxy (Nginx, Cloudflare, Heroku, Render, ...)
// so express-rate-limit reads the real client IP from X-Forwarded-For instead of treating
// every request as coming from the proxy.
app.set('trust proxy', 1)

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
      'style-src': ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CDN to fetch /uploads
}))

app.use(compression())

const CLIENT_URLS = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim())
app.use(cors({ origin: CLIENT_URLS, credentials: true }))
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

// Serve SPA build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.use((req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy API.' }))
}
app.use((error, req, res, next) => {
  console.error(error)
  if (error.name === 'PrismaClientInitializationError') {
    return res.status(503).json({ message: 'Không kết nối được PostgreSQL. Vui lòng kiểm tra DATABASE_URL và đảm bảo database server đang chạy.' })
  }
  const status = error.code === 'P2002' ? 409 : 500
  const message = error.code === 'P2002' ? 'Dữ liệu đã tồn tại, vui lòng kiểm tra slug hoặc email.' : 'Có lỗi xảy ra, vui lòng thử lại.'
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

