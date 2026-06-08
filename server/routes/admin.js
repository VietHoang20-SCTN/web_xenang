const express = require('express')
const prisma = require('../prisma')
const { requireAuth } = require('../middleware/auth')
const { parseSpecs, slugify } = require('../utils')

const router = express.Router()
router.use(requireAuth)

router.get('/dashboard', async (req, res, next) => {
  try {
    const [products, categories, newLeads, leads] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count()
    ])
    res.json({ products, categories, newLeads, leads })
  } catch (error) {
    next(error)
  }
})

router.get('/categories', async (req, res, next) => {
  try {
    res.json(await prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }))
  } catch (error) {
    next(error)
  }
})

router.post('/categories', async (req, res, next) => {
  try {
    const { name, slug, description, sortOrder, isActive } = req.body
    if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' })
    const category = await prisma.category.create({ data: { name, slug: slug || slugify(name), description, sortOrder: Number(sortOrder || 0), isActive: isActive ?? true } })
    res.status(201).json(category)
  } catch (error) {
    next(error)
  }
})

router.put('/categories/:id', async (req, res, next) => {
  try {
    const { name, slug, description, sortOrder, isActive } = req.body
    const category = await prisma.category.update({ where: { id: req.params.id }, data: { name, slug: slug || slugify(name), description, sortOrder: Number(sortOrder || 0), isActive: Boolean(isActive) } })
    res.json(category)
  } catch (error) {
    next(error)
  }
})

router.delete('/categories/:id', async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/products', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50))
    const [items, total] = await Promise.all([
      prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.product.count()
    ])
    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
})

router.post('/products', async (req, res, next) => {
  try {
    const { name, slug, categoryId, tag, image, gallery, summary, description, specs, isFeatured, isActive } = req.body
    if (!name || !categoryId) return res.status(400).json({ message: 'Tên sản phẩm và danh mục là bắt buộc.' })
    const product = await prisma.product.create({ data: { name, slug: slug || slugify(name), categoryId, tag, image, gallery: Array.isArray(gallery) ? gallery : [], summary, description, specs: parseSpecs(specs), isFeatured: Boolean(isFeatured), isActive: isActive ?? true } })
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

router.put('/products/:id', async (req, res, next) => {
  try {
    const { name, slug, categoryId, tag, image, gallery, summary, description, specs, isFeatured, isActive } = req.body
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { name, slug: slug || slugify(name), categoryId, tag, image, gallery: Array.isArray(gallery) ? gallery : [], summary, description, specs: parseSpecs(specs), isFeatured: Boolean(isFeatured), isActive: Boolean(isActive) } })
    res.json(product)
  } catch (error) {
    next(error)
  }
})

router.delete('/products/:id', async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/services', async (req, res, next) => {
  try {
    res.json(await prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }))
  } catch (error) {
    next(error)
  }
})

router.post('/services', async (req, res, next) => {
  try {
    const { title, slug, description, icon, sortOrder, isActive } = req.body
    if (!title) return res.status(400).json({ message: 'Tên dịch vụ là bắt buộc.' })
    const service = await prisma.service.create({ data: { title, slug: slug || slugify(title), description, icon, sortOrder: Number(sortOrder || 0), isActive: isActive ?? true } })
    res.status(201).json(service)
  } catch (error) {
    next(error)
  }
})

router.put('/services/:id', async (req, res, next) => {
  try {
    const { title, slug, description, icon, sortOrder, isActive } = req.body
    const service = await prisma.service.update({ where: { id: req.params.id }, data: { title, slug: slug || slugify(title), description, icon, sortOrder: Number(sortOrder || 0), isActive: Boolean(isActive) } })
    res.json(service)
  } catch (error) {
    next(error)
  }
})

router.delete('/services/:id', async (req, res, next) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/leads', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50))
    const [items, total] = await Promise.all([
      prisma.lead.findMany({ include: { product: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.lead.count()
    ])
    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
})

router.put('/leads/:id', async (req, res, next) => {
  try {
    const { status, note } = req.body
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: { status, note } })
    res.json(lead)
  } catch (error) {
    next(error)
  }
})

router.delete('/leads/:id', async (req, res, next) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/site-settings', async (req, res, next) => {
  try {
    res.json(await prisma.siteSetting.findFirst({ orderBy: { createdAt: 'asc' } }))
  } catch (error) {
    next(error)
  }
})

router.put('/site-settings', async (req, res, next) => {
  try {
    const current = await prisma.siteSetting.findFirst({ orderBy: { createdAt: 'asc' } })
    const data = { brand: req.body.brand, hotline: req.body.hotline, zalo: req.body.zalo, email: req.body.email, address: req.body.address, mapEmbed: req.body.mapEmbed, logo: req.body.logo, logoDark: req.body.logoDark }
    const settings = current ? await prisma.siteSetting.update({ where: { id: current.id }, data }) : await prisma.siteSetting.create({ data })
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

module.exports = router
