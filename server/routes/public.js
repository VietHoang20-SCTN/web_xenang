const express = require('express')
const rateLimit = require('express-rate-limit')
const prisma = require('../prisma')
const { validate, leadSchema } = require('../schemas')

const router = express.Router()

// Throttle lead submissions: a real user fills the form once or twice;
// anything above 5 in 10 minutes from the same IP is almost certainly a bot.
const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 10 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
})

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

router.get('/services/:slug', async (req, res, next) => {
  try {
    const service = await prisma.service.findFirst({ where: { slug: req.params.slug, isActive: true } })
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ.' })
    res.json(service)
  } catch (error) {
    next(error)
  }
})

router.get('/blog', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 6))
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.blogPost.count({ where: { isPublished: true } })
    ])
    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
})

router.get('/blog/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({ where: { slug: req.params.slug, isPublished: true } })
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' })
    res.json(post)
  } catch (error) {
    next(error)
  }
})

router.post('/leads', leadLimiter, validate(leadSchema), async (req, res, next) => {
  try {
    const { name, phone, company, need, productId } = req.body
    const lead = await prisma.lead.create({ data: { name, phone, company: company || null, need, productId: productId || null } })
    res.status(201).json(lead)
  } catch (error) {
    next(error)
  }
})

module.exports = router

