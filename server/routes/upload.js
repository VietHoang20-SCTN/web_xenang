const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { requireAuth } = require('../middleware/auth')
const { slugify } = require('../utils')

const router = express.Router()
const uploadDir = path.join(__dirname, '..', 'uploads')

fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Chỉ cho phép upload file ảnh.'))
    cb(null, true)
  }
})

// Helper: catch multer errors in Express 5 where error propagation differs
function uploadHandler(fn) {
  return (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return next(err)
      fn(req, res, next).catch(next)
    })
  }
}

function logoHandler(fn) {
  return (req, res, next) => {
    upload.single('logo')(req, res, (err) => {
      if (err) return next(err)
      fn(req, res, next).catch(next)
    })
  }
}

router.post('/product-image', requireAuth, uploadHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh sản phẩm.' })
  const base = slugify(path.basename(req.file.originalname, path.extname(req.file.originalname))) || 'product-image'
  const filename = `${Date.now()}-${base}.webp`
  const outputPath = path.join(uploadDir, filename)

  await sharp(req.file.buffer)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outputPath)

  res.status(201).json({ url: `/uploads/${filename}` })
}))

router.post('/logo', requireAuth, logoHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file logo.' })
  const filename = `site-logo-${Date.now()}.webp`
  const outputPath = path.join(uploadDir, filename)

  await sharp(req.file.buffer)
    .rotate()
    .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(outputPath)

  res.status(201).json({ url: `/uploads/${filename}` })
}))

module.exports = router
