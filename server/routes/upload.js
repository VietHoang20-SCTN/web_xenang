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

router.post('/product-image', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error)
  }
})

module.exports = router
