function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseSpecs(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return String(value).split('\n').map((item) => item.trim()).filter(Boolean)
}

function sanitize(input) {
  if (typeof input === 'string') {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim()
  }
  if (Array.isArray(input)) return input.map(sanitize)
  if (input !== null && typeof input === 'object') {
    const result = {}
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitize(value)
    }
    return result
  }
  return input
}

module.exports = { slugify, parseSpecs, sanitize }
