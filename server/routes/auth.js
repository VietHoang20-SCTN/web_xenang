const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const prisma = require('../prisma')
const { requireAuth } = require('../middleware/auth')
const { validate, loginSchema } = require('../schemas')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required.')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const router = express.Router()

router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await prisma.adminUser.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.adminUser.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, name: true, role: true } })
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' })
    res.json(user)
  } catch (error) {
    next(error)
  }
})

module.exports = router
