const express = require('express')
const prisma = require('../prisma')

const router = express.Router()

router.get('/site-settings', async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findFirst({ orderBy: { createdAt: 'asc' } })
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

router.get('/products', async (req, res, next) => {
  try {
    const where = { isActive: true }
    if (req.query.category) where.category = { slug: req.query.category }
    const products = await prisma.product.findMany({ where, include: { category: true }, orderBy: { createdAt: 'desc' } })
    res.json(products)
  } catch (error) {
    next(error)
  }
})

router.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({ where: { slug: req.params.slug, isActive: true }, include: { category: true } })
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
    res.json(product)
  } catch (error) {
    next(error)
  }
})

router.get('/services', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
    res.json(services)
  } catch (error) {
    next(error)
  }
})

router.post('/leads', async (req, res, next) => {
  try {
    const { name, phone, company, need, productId } = req.body
    if (!name || !phone || !need) return res.status(400).json({ message: 'Vui lòng nhập họ tên, số điện thoại và nhu cầu.' })
    const lead = await prisma.lead.create({ data: { name, phone, company: company || null, need, productId: productId || null } })
    res.status(201).json(lead)
  } catch (error) {
    next(error)
  }
})

module.exports = router
