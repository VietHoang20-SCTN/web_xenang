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

// Trim whitespace recursively for incoming JSON bodies.
// We intentionally do NOT HTML-escape values here because:
//   1. React (JSX) auto-escapes when rendering, so storing escaped strings would result in double-escaping.
//   2. Prisma uses parameterized queries, so SQL injection is not a concern.
//   3. Fields like `mapEmbed` (Google Maps URL) contain `&`, `=`, `?` which must remain intact.
// If a rich-text field is added later, sanitize that specific field with DOMPurify on the client
// or a server-side allowlist sanitizer (e.g. sanitize-html), not blanket-escape every string.
function sanitize(input) {
  if (typeof input === 'string') return input.trim()
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
