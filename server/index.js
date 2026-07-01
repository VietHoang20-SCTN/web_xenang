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

// Catch unhandled rejections & exceptions so the server never silently dies.
process.on('unhandledRejection', (reason) => console.error('[UNHANDLED_REJECTION]', reason))
process.on('uncaughtException', (err) => console.error('[UNCAUGHT_EXCEPTION]', err))

// Ensure local uploads directory exists (fallback; new uploads go to Cloudinary)
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

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
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CDN to fetch /uploads
}))

app.use(compression())

const CLIENT_URLS = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim())
app.use(cors({ origin: CLIENT_URLS, credentials: true }))
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

// Serve SPA build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(distPath))
  app.use((req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  app.use((req, res) => res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y API.' }))
}
app.use((error, req, res, next) => {
  console.error('[ERROR]', error.name, error.message, error.code || '')
  if (error.name === 'PrismaClientInitializationError') {
    return res.status(503).json({ message: 'KhÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c PostgreSQL. Vui lÃ²ng kiá»ƒm tra DATABASE_URL vÃ  Ä‘áº£m báº£o database server Ä‘ang cháº¡y.' })
  }
  if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Dá»¯ liá»‡u Ä‘Ã£ tá»“n táº¡i, vui lÃ²ng kiá»ƒm tra slug hoáº·c email.' })
    if (error.code === 'P2025') return res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u.' })
    return res.status(500).json({ message: `Lá»—i database: ${error.message}` })
  }
  // Multer / file upload errors
  if (error.name === 'MulterError') {
    return res.status(400).json({ message: `Lá»—i upload: ${error.message}` })
  }
  if (error.message?.includes('Chá»‰ cho phÃ©p upload file áº£nh')) {
    return res.status(400).json({ message: error.message })
  }
  const status = error.status || error.statusCode || 500
  const message = error.message || 'CÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i.'
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

