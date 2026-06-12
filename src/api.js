const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function getToken() {
  return localStorage.getItem('adminToken')
}

export function setToken(token) {
  localStorage.setItem('adminToken', token)
}

export function clearToken() {
  localStorage.removeItem('adminToken')
}

export async function api(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'Có lỗi xảy ra.')
  return data
}

export function assetUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_ORIGIN}${path}`
}

export async function uploadProductImage(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('image', file)
  const response = await fetch(`${API_URL}/upload/product-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'Không upload được ảnh.')
  return data
}

export async function uploadLogo(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('logo', file)
  const response = await fetch(`${API_URL}/upload/logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'Không upload được logo.')
  return data
}
