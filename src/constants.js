import { Factory, PackageCheck, Settings, ShieldCheck, Truck, Zap, Wrench, Cog, Gauge, BatteryFull, HardDrive, BarChart3, ClipboardCheck, Users, Recycle, Timer } from 'lucide-react'

export const emptyProduct = { id: null, name: '', slug: '', categoryId: '', tag: '', image: '', gallery: [], summary: '', description: '', content: '', specs: [''], isActive: true }
export const emptyCategory = { id: null, name: '', slug: '', description: '', sortOrder: 0, isActive: true }
export const emptyService = { id: null, title: '', slug: '', description: '', content: '', icon: 'Settings', sortOrder: 0, isActive: true }
export const leadStatuses = { NEW: 'Mới', CONTACTED: 'Đã liên hệ', QUOTED: 'Đã báo giá', DONE: 'Hoàn tất', CANCELLED: 'Hủy' }
export const serviceIcons = { Truck, PackageCheck, Settings, Factory, ShieldCheck, Zap, Wrench, Cog, Gauge, BatteryFull, HardDrive, BarChart3, ClipboardCheck, Users, Recycle, Timer }
export const serviceIconLabels = {
  Truck: 'Vận chuyển', PackageCheck: 'Đóng gói', Settings: 'Cài đặt', Factory: 'Nhà máy',
  ShieldCheck: 'Bảo hành', Zap: 'Nhanh chóng', Wrench: 'Sửa chữa', Cog: 'Kỹ thuật',
  Gauge: 'Hiệu suất', BatteryFull: 'Pin/Điện', HardDrive: 'Thiết bị', BarChart3: 'Phân tích',
  ClipboardCheck: 'Kiểm định', Users: 'Tư vấn', Recycle: 'Tái chế', Timer: 'Bảo trì'
}

export const mapEmbedUrl = (url, address) => {
  if (!url && !address) return ''
  if (!url) return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  
  // Decode HTML entities (database may store &lt; &gt; &quot; &amp;)
  const decoded = url.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  
  // If user pasted full iframe tag, extract src
  const iframeSrc = decoded.match(/src=["']([^"']+)["']/i)?.[1]
  const mapUrl = (iframeSrc || decoded).trim()
  
  // Already an embed URL
  if (mapUrl.includes('/embed') || mapUrl.includes('output=embed')) return mapUrl
  
  // Shortened links (maps.app.goo.gl, goo.gl/maps) — use address fallback for embed
  if (mapUrl.includes('maps.app.goo.gl') || mapUrl.includes('goo.gl/maps')) {
    return address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1`
  }
  
  // Google Maps place URL with @lat,lng or /place/
  const placeMatch = mapUrl.match(/place\/([^/@]+)/)
  if (placeMatch) return `https://www.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}&output=embed`
  
  const coordMatch = mapUrl.match(/@([-\d.]+),([-\d.]+)/)
  if (coordMatch) return `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`
  
  // URL with ?q= parameter
  try {
    const parsedUrl = new URL(mapUrl)
    const query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query')
    if (query) return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
  } catch {}
  
  // Last resort: use address
  return address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : ''
}

export const mapOpenUrl = (url, address) => url?.match(/src=["']([^"']+)["']/i)?.[1] || url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`
