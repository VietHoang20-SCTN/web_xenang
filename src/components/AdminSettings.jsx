import React from 'react'
import { Building2, Mail, MapPinned, MapPin, MessageCircle, Phone, Save } from 'lucide-react'
import { api } from '../api'

export default function AdminSettings({ settings, onRefresh }) {
  const onSave = async (event) => {
    event.preventDefault()
    const form = event.target
    const data = {
      brand: form.brand.value, hotline: form.hotline.value, zalo: form.zalo.value,
      email: form.email.value, address: form.address.value, mapEmbed: form.mapEmbed.value
    }
    await api('/admin/site-settings', { method: 'PUT', body: JSON.stringify(data) })
    alert('Đã lưu cấu hình.'); onRefresh()
  }

  const fields = [
    { field: 'brand', label: 'Tên thương hiệu', icon: Building2, hint: 'Hiển thị ở header và footer' },
    { field: 'hotline', label: 'Hotline', icon: Phone, hint: 'Dùng cho nút gọi nhanh' },
    { field: 'zalo', label: 'Link Zalo', icon: MessageCircle, hint: 'Dùng cho CTA chat Zalo' },
    { field: 'email', label: 'Email', icon: Mail, hint: 'Hiển thị ở khối liên hệ' },
    { field: 'address', label: 'Địa chỉ', icon: MapPin, hint: 'Địa chỉ showroom/cửa hàng' },
    { field: 'mapEmbed', label: 'Google Maps', icon: MapPinned, hint: 'Link nhúng bản đồ' }
  ]

  return (
    <form className="quote-form settings-form" onSubmit={onSave}>
      {fields.map(({ field, label, icon: Icon, hint }) => (
        <label className="setting-field" key={field}>
          <span><Icon size={18} /><strong>{label}</strong></span>
          <small>{hint}</small>
          <input name={field} defaultValue={settings?.[field] || ''} />
        </label>
      ))}
      <button className="primary-btn"><Save size={16} /> Lưu cấu hình</button>
    </form>
  )
}
