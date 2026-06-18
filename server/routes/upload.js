const express = require('express')
const multer = require('multer')
const { requireAuth } = require('../middleware/auth')
const { uploadLogo, uploadProductImage, uploadAboutImage } = require('../cloudinary')

const router = express.Router()

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
  const url = await uploadProductImage(req.file.buffer)
  res.status(201).json({ url })
}))

router.post('/logo', requireAuth, logoHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file logo.' })
  const url = await uploadLogo(req.file.buffer)
  res.status(201).json({ url })
}))

router.post('/about-image', requireAuth, uploadHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh giới thiệu.' })
  const url = await uploadAboutImage(req.file.buffer)
  res.status(201).json({ url })
}))

module.exports = router
