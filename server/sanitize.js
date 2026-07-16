const sanitizeHtml = require('sanitize-html')

const RICH_TEXT_OPTIONS = {
  allowedTags: [
    'p', 'br', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
    'a', 'strong', 'em', 'b', 'i', 'u',
    'img', 'blockquote', 'pre', 'code',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName: 'a',
      attribs: {
        ...attribs,
        rel: 'noopener noreferrer',
        ...(attribs.href && /^https?:/.test(attribs.href) ? { target: '_blank' } : {}),
      },
    }),
  },
  disallowedTagsMode: 'discard',
}

function sanitizeRichText(html) {
  if (html == null || html === '') return ''
  return sanitizeHtml(String(html), RICH_TEXT_OPTIONS)
}

const GOOGLE_MAPS_EMBED = /^https:\/\/(www\.)?google\.com\/maps\/embed\?/i

function sanitizeMapEmbed(raw) {
  if (raw == null || raw === '') return ''
  const trimmed = String(raw).trim()
  const srcMatch = trimmed.match(/<iframe[^>]*\bsrc=["']([^"']+)["']/i)
  const url = srcMatch ? srcMatch[1] : trimmed
  if (!GOOGLE_MAPS_EMBED.test(url)) return ''
  return url
}

module.exports = { sanitizeRichText, sanitizeMapEmbed, GOOGLE_MAPS_EMBED }
