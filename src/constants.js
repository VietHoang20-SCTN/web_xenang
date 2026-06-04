import { Factory, PackageCheck, Settings, ShieldCheck, Truck, Zap } from 'lucide-react'

export const emptyProduct = { id: null, name: '', slug: '', categoryId: '', tag: '', image: '', gallery: [], summary: '', specs: [''], isActive: true }
export const emptyCategory = { id: null, name: '', slug: '', description: '', sortOrder: 0, isActive: true }
export const emptyService = { id: null, title: '', slug: '', description: '', icon: 'Settings', sortOrder: 0, isActive: true }
export const leadStatuses = { NEW: 'Mới', CONTACTED: 'Đã liên hệ', QUOTED: 'Đã báo giá', DONE: 'Hoàn tất', CANCELLED: 'Hủy' }
export const serviceIcons = { Truck, PackageCheck, Settings, Factory, ShieldCheck, Zap }

export const mapEmbedUrl = (url, address) => {
  if (!url) return address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : ''
  const iframeSrc = url.match(/src=["']([^"']+)["']/i)?.[1]
  const mapUrl = iframeSrc || url.trim()
  if (mapUrl.includes('/embed') || mapUrl.includes('output=embed')) return mapUrl
  if (mapUrl.includes('maps.app.goo.gl') || mapUrl.includes('goo.gl/maps')) return ''
  try {
    const parsedUrl = new URL(mapUrl)
    const query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query')
    return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : ''
  } catch {
    return ''
  }
}

export const mapOpenUrl = (url, address) => url?.match(/src=["']([^"']+)["']/i)?.[1] || url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`
