const express = require('express')
const multer = require('multer')
const { requireAuth } = require('../middleware/auth')
const { uploadLogo, uploadProductImage, uploadAboutImage } = require('../cloudinary')
// const fileType = require('file-type')
const { fileTypeFromBuffer } = require('file-type')

const router = express.Router()

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
      return cb(new Error('Chỉ cho phép upload ảnh (jpg, png, webp, gif).'))
    }
    cb(null, true)
  }
})

async function verifyMagicBytes(req, res, next) {
  if (!req.file?.buffer) return next()
  try {
    // const detected = await fileType.fromBuffer(req.file.buffer)
    const detected = await fileTypeFromBuffer(req.file.buffer)
    if (!detected || !ALLOWED_MIME.has(detected.mime)) {
      return res.status(400).json({ message: 'File không hợp lệ. Chỉ chấp nhận jpg, png, webp, gif.' })
    }
    req.file.mimetype = detected.mime
    next()
  } catch (err) {
    next(err)
  }
}

// Helper: catch multer errors in Express 5 where error propagation differs
function uploadHandler(fn) {
  return (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return next(err)
      verifyMagicBytes(req, res, (err) => {
        if (err) return next(err)
        fn(req, res, next).catch(next)
      })
    })
  }
}

function logoHandler(fn) {
  return (req, res, next) => {
    upload.single('logo')(req, res, (err) => {
      if (err) return next(err)
      verifyMagicBytes(req, res, (err) => {
        if (err) return next(err)
        fn(req, res, next).catch(next)
      })
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
