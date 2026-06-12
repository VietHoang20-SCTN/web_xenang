const cloudinary = require('cloudinary').v2

// Configure Cloudinary using a single CLOUDINARY_URL environment variable,
// or individual CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET.
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const FOLDER = process.env.CLOUDINARY_FOLDER || 'xenang'

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - Image file buffer.
 * @param {object} [options]
 * @param {string} [options.publicId] - Optional public ID (without extension).
 * @param {number} [options.width] - Max width for resizing.
 * @param {number} [options.height] - Max height for resizing.
 * @param {number} [options.quality] - WebP quality 1–100.
 * @returns {Promise<string>} Secure URL of the uploaded image.
 */
async function uploadImage(buffer, options = {}) {
  const { publicId, width, height, quality = 82 } = options

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          { width, height, crop: 'fit', quality: 'auto:best' },
          { quality, fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })

  return result.secure_url
}

/**
 * Upload a logo image to Cloudinary (optimised for logos with higher quality).
 */
async function uploadLogo(buffer) {
  return uploadImage(buffer, {
    width: 400,
    height: 400,
    quality: 90,
  })
}

/**
 * Upload a product image to Cloudinary.
 */
async function uploadProductImage(buffer) {
  return uploadImage(buffer, {
    width: 1920,
    height: 1920,
    quality: 82,
  })
}

/**
 * Delete an image from Cloudinary by its secure URL.
 * @param {string} url - The full Cloudinary URL to delete.
 */
async function deleteImage(url) {
  if (!url || !url.includes('cloudinary.com')) return

  // Extract public ID from URL: …/v123456/folder/publicid.webp
  const parts = url.split('/')
  const fileWithExt = parts[parts.length - 1] // e.g. "publicid.webp"
  const publicId = `${FOLDER}/${fileWithExt.replace(/\.\w+$/, '')}`

  await cloudinary.uploader.destroy(publicId)
}

module.exports = { uploadImage, uploadLogo, uploadProductImage, deleteImage, cloudinary }