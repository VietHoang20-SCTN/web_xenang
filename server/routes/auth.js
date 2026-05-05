const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' })
    const user = await prisma.adminUser.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
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
