const API_URL = import.meta.env.VITE_API_URL || '/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

/**
 * No more localStorage tokens!
 * Auth is handled via HttpOnly cookies set by the server on /auth/login.
 * The cookie is auto-sent with every fetch (same-origin / withCredentials).
 */

export function api(path, options = {}) {
  // For FormData, fetch omits Content-Type so the boundary is auto-set
  const isFormData = options.body instanceof FormData
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // ← sends HttpOnly cookie
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  }).then(async (response) => {
    if (response.status === 204) return null
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '')
    if (!response.ok) {
      const message = typeof data === 'object' ? data?.message : data
      throw new Error(message || `Yêu cầu thất bại (${response.status}).`)
    }
    return data
  })
}

export function assetUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_ORIGIN}${path}`
}

export async function uploadProductImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  return api('/upload/product-image', { method: 'POST', body: formData, headers: {} })
}

export async function uploadLogo(file) {
  const formData = new FormData()
  formData.append('logo', file)
  return api('/upload/logo', { method: 'POST', body: formData, headers: {} })
}

export async function uploadAboutImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  return api('/upload/about-image', { method: 'POST', body: formData, headers: {} })
}

export async function uploadServiceImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  return api('/upload/service-image', { method: 'POST', body: formData, headers: {} })
}
