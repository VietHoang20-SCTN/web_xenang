require('dotenv').config()
const cors = require('cors')
const express = require('express')
const path = require('path')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth')
const publicRoutes = require('./routes/public')
const uploadRoutes = require('./routes/upload')

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy API.' }))
app.use((error, req, res, next) => {
  console.error(error)
  if (error.name === 'PrismaClientInitializationError') {
    return res.status(503).json({ message: 'Không kết nối được PostgreSQL. Vui lòng kiểm tra DATABASE_URL và đảm bảo database server đang chạy.' })
  }
  const status = error.code === 'P2002' ? 409 : 500
  const message = error.code === 'P2002' ? 'Dữ liệu đã tồn tại, vui lòng kiểm tra slug hoặc email.' : 'Có lỗi xảy ra, vui lòng thử lại.'
  res.status(status).json({ message })
})

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`)
})
