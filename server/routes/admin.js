const express = require('express')
const prisma = require('../prisma')
const { requireAuth, auditMiddleware } = require('../middleware/auth')
const { parseSpecs, slugify } = require('../utils')
const { validate, categorySchema, productSchema, serviceSchema, leadUpdateSchema, siteSettingsSchema } = require('../schemas')

const router = express.Router()
router.use(requireAuth)

// ── Dashboard ──
router.get('/dashboard', async (req, res, next) => {
  try {
    const [products, categories, newLeads, leads, blogCount] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count(),
      prisma.blogPost.count()
    ])
    res.json({ products, categories, newLeads, leads, blogCount })
  } catch (error) {
    next(error)
  }
})

// ── Audit Log ──
router.get('/audit-log', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50))
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.auditLog.count()
    ])
    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
})

// ── Categories ──
router.get('/categories', async (req, res, next) => {
  try {
    res.json(await prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }))
  } catch (error) {
    next(error)
  }
})

router.post('/categories', validate(categorySchema), auditMiddleware('Category'), async (req, res, next) => {
  try {
    const { name, slug, description, sortOrder, isActive } = req.body
    const category = await prisma.category.create({ data: { name, slug: slug || slugify(name), description, sortOrder, isActive } })
    res.status(201).json(category)
  } catch (error) {
    next(error)
  }
})

router.put('/categories/:id', validate(categorySchema), auditMiddleware('Category'), async (req, res, next) => {
  try {
    const { name, slug, description, sortOrder, isActive } = req.body
    const category = await prisma.category.update({ where: { id: req.params.id }, data: { name, slug: slug || slugify(name), description, sortOrder, isActive } })
    res.json(category)
  } catch (error) {
    next(error)
  }
})

router.delete('/categories/:id', auditMiddleware('Category'), async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// ── Products ──
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

router.post('/products', validate(productSchema), auditMiddleware('Product'), async (req, res, next) => {
  try {
    const { name, slug, categoryId, tag, image, gallery, summary, description, content, specs, isFeatured, isActive } = req.body
    const product = await prisma.product.create({ data: { name, slug: slug || slugify(name), categoryId, tag, image, gallery, summary, description, content, specs: parseSpecs(specs), isFeatured, isActive } })
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

router.put('/products/:id', validate(productSchema), auditMiddleware('Product'), async (req, res, next) => {
  try {
    const { name, slug, categoryId, tag, image, gallery, summary, description, content, specs, isFeatured, isActive } = req.body
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { name, slug: slug || slugify(name), categoryId, tag, image, gallery, summary, description, content, specs: parseSpecs(specs), isFeatured, isActive } })
    res.json(product)
  } catch (error) {
    next(error)
  }
})

router.delete('/products/:id', auditMiddleware('Product'), async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// ── Services ──
router.get('/services', async (req, res, next) => {
  try {
    res.json(await prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }))
  } catch (error) {
    next(error)
  }
})

router.post('/services', validate(serviceSchema), auditMiddleware('Service'), async (req, res, next) => {
  try {
    const { title, slug, description, content, icon, sortOrder, isActive } = req.body
    const service = await prisma.service.create({ data: { title, slug: slug || slugify(title), description, content, icon, sortOrder, isActive } })
    res.status(201).json(service)
  } catch (error) {
    next(error)
  }
})

router.put('/services/:id', validate(serviceSchema), auditMiddleware('Service'), async (req, res, next) => {
  try {
    const { title, slug, description, content, icon, sortOrder, isActive } = req.body
    const service = await prisma.service.update({ where: { id: req.params.id }, data: { title, slug: slug || slugify(title), description, content, icon, sortOrder, isActive } })
    res.json(service)
  } catch (error) {
    next(error)
  }
})

router.delete('/services/:id', auditMiddleware('Service'), async (req, res, next) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// ── Leads ──
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

router.put('/leads/:id', validate(leadUpdateSchema), auditMiddleware('Lead'), async (req, res, next) => {
  try {
    const { status, note } = req.body
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: { status, note } })
    res.json(lead)
  } catch (error) {
    next(error)
  }
})

router.delete('/leads/:id', auditMiddleware('Lead'), async (req, res, next) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// ── Site Settings ──
router.get('/site-settings', async (req, res, next) => {
  try {
    res.json(await prisma.siteSetting.findFirst({ orderBy: { createdAt: 'asc' } }))
  } catch (error) {
    next(error)
  }
})

router.put('/site-settings', validate(siteSettingsSchema), auditMiddleware('SiteSetting'), async (req, res, next) => {
  try {
    const current = await prisma.siteSetting.findFirst({ orderBy: { createdAt: 'asc' } })
    const { brand, hotline, zalo, email, address, mapEmbed, logo, logoDark, heroTitle, heroSubtitle, aboutTitle, aboutBody, aboutImage, aboutImages } = req.body
    const data = { brand, hotline, zalo, email, address, mapEmbed, logo, logoDark, heroTitle, heroSubtitle, aboutTitle, aboutBody, aboutImage, aboutImages }
    const settings = current ? await prisma.siteSetting.update({ where: { id: current.id }, data }) : await prisma.siteSetting.create({ data })
    res.json(settings)
  } catch (error) {
    next(error)
  }
})

// ── Blog ──
router.get('/blog', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50))
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.blogPost.count()
    ])
    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
})

router.post('/blog', auditMiddleware('BlogPost'), async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, coverImage, tags, isPublished } = req.body
    const post = await prisma.blogPost.create({ data: { title, slug: slug || slugify(title), excerpt, content, coverImage, tags, isPublished } })
    res.status(201).json(post)
  } catch (error) {
    next(error)
  }
})

router.put('/blog/:id', auditMiddleware('BlogPost'), async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, coverImage, tags, isPublished } = req.body
    const post = await prisma.blogPost.update({ where: { id: req.params.id }, data: { title, slug: slug || slugify(title), excerpt, content, coverImage, tags, isPublished } })
    res.json(post)
  } catch (error) {
    next(error)
  }
})

router.delete('/blog/:id', auditMiddleware('BlogPost'), async (req, res, next) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router
