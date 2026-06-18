// Zod schemas for server-side validation.
// These enforce the same rules as the client forms but are non-bypassable.
const { z } = require('zod')

// Vietnamese phone: starts with 0 or +84, then 3/5/7/8/9, then 8 digits.
const vnPhone = z
  .string()
  .min(1, 'Số điện thoại là bắt buộc.')
  .transform((val) => val.replace(/\s/g, ''))
  .pipe(
    z.string().regex(/^(0|\+84)(3|5|7|8|9)\d{8}$/, 'Số điện thoại Việt Nam không hợp lệ (cần đủ 10 chữ số).')
  )

// --- Public form: Lead submission ---
const leadSchema = z.object({
  name: z.string().min(1, 'Họ tên là bắt buộc.').max(200, 'Họ tên quá dài.'),
  phone: vnPhone,
  company: z.string().max(300).optional().nullable(),
  need: z.string().min(1, 'Nhu cầu tư vấn là bắt buộc.').max(2000, 'Nội dung quá dài (tối đa 2000 ký tự).'),
  productId: z.string().max(100).optional().nullable(),
})

// --- Admin: Categories ---
const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc.').max(200),
  slug: z.string().max(250).optional().default(''),
  description: z.string().max(2000).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
})

// --- Admin: Services ---
const serviceSchema = z.object({
  title: z.string().min(1, 'Tên dịch vụ là bắt buộc.').max(200),
  slug: z.string().max(250).optional().default(''),
  description: z.string().max(5000).optional().nullable(),
  content: z.string().max(50000).optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
})

// --- Admin: Products ---
const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc.').max(300),
  slug: z.string().max(350).optional().default(''),
  categoryId: z.string().min(1, 'Danh mục là bắt buộc.'),
  tag: z.string().max(100).optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  gallery: z.array(z.string().max(500)).max(20).default([]),
  summary: z.string().max(1000).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  content: z.string().max(50000).optional().nullable(),
  specs: z.array(z.string().max(500)).max(50).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

// --- Admin: Lead status update ---
const leadUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'DONE', 'CANCELLED']),
  note: z.string().max(5000).optional().nullable(),
})

// --- Admin: Site settings ---
const siteSettingsSchema = z.object({
  brand: z.string().min(1).max(200),
  hotline: z.string().min(1).max(50),
  zalo: z.string().max(500),
  email: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  mapEmbed: z.string().max(5000).optional().nullable(),
  logo: z.string().max(500).optional().nullable(),
  logoDark: z.string().max(500).optional().nullable(),
  heroTitle: z.string().max(500).optional().nullable(),
  heroSubtitle: z.string().max(1000).optional().nullable(),
  aboutTitle: z.string().max(500).optional().nullable(),
  aboutBody: z.string().max(50000).optional().nullable(),
  aboutImage: z.string().max(500).optional().nullable(),
  aboutImages: z.array(z.string().max(500)).max(20).default([]),
})

// --- Auth: Login ---
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ.').max(200),
  password: z.string().min(1, 'Mật khẩu là bắt buộc.').max(200),
})

// Helper: validate and return parsed body or throw 400 response.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const firstError = result.error.issues[0]
      return res.status(400).json({ message: firstError.message })
    }
    req.body = result.data
    next()
  }
}

module.exports = {
  leadSchema,
  categorySchema,
  serviceSchema,
  productSchema,
  leadUpdateSchema,
  siteSettingsSchema,
  loginSchema,
  validate,
}
