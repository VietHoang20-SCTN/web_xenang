import React, { useRef, useState } from 'react'
import { Building2, ImageUp, Mail, MapPinned, MapPin, MessageCircle, Moon, Phone, Save, Sun, Trash2 } from 'lucide-react'
import { api, assetUrl, uploadLogo } from '../api'

export default function AdminSettings({ settings, onRefresh }) {
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoDarkPreview, setLogoDarkPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingDark, setUploadingDark] = useState(false)
  const fileRef = useRef(null)
  const fileDarkRef = useRef(null)

  const onSave = async (event) => {
    event.preventDefault()
    const form = event.target
    const data = {
      brand: form.brand.value, hotline: form.hotline.value, zalo: form.zalo.value,
      email: form.email.value, address: form.address.value, mapEmbed: form.mapEmbed.value,
      logo: logoPreview !== null ? logoPreview : (settings?.logo || null),
      logoDark: logoDarkPreview !== null ? logoDarkPreview : (settings?.logoDark || null)
    }
    await api('/admin/site-settings', { method: 'PUT', body: JSON.stringify(data) })
    alert('Đã lưu cấu hình.'); onRefresh()
  }

  const handleLogoUpload = async (event, isDark = false) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      isDark ? setUploadingDark(true) : setUploading(true)
      const result = await uploadLogo(file)
      isDark ? setLogoDarkPreview(result.url) : setLogoPreview(result.url)
    } catch (error) {
      alert(error.message)
    } finally {
      isDark ? setUploadingDark(false) : setUploading(false)
    }
  }

  const removeLogo = (isDark = false) => {
    if (isDark) {
      setLogoDarkPreview('')
      if (fileDarkRef.current) fileDarkRef.current.value = ''
    } else {
      setLogoPreview('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const currentLogo = logoPreview !== null ? logoPreview : settings?.logo
  const currentLogoDark = logoDarkPreview !== null ? logoDarkPreview : settings?.logoDark

  const fields = [
    { field: 'brand', label: 'Tên thương hiệu', icon: Building2, hint: 'Hiển thị ở header và footer' },
    { field: 'hotline', label: 'Hotline', icon: Phone, hint: 'Dùng cho nút gọi nhanh' },
    { field: 'zalo', label: 'Link Zalo', icon: MessageCircle, hint: 'Dùng cho CTA chat Zalo' },
    { field: 'email', label: 'Email', icon: Mail, hint: 'Hiển thị ở khối liên hệ' },
    { field: 'address', label: 'Địa chỉ', icon: MapPin, hint: 'Địa chỉ showroom/cửa hàng' },
    { field: 'mapEmbed', label: 'Nhúng bản đồ (iframe)', icon: MapPinned, hint: 'Mở Google Maps → Chia sẻ → Nhúng bản đồ → Copy mã iframe và dán vào đây', isTextarea: true }
  ]

  const renderLogoUpload = (isDark) => {
    const current = isDark ? currentLogoDark : currentLogo
    const ref = isDark ? fileDarkRef : fileRef
    const isUploading = isDark ? uploadingDark : uploading
    const label = isDark ? 'Logo Dark Mode' : 'Logo Light Mode'
    const hint = isDark
      ? 'Logo hiển thị khi ở chế độ tối. Nên dùng logo màu sáng/trắng.'
      : 'Logo hiển thị khi ở chế độ sáng. Nên dùng logo màu tối/đậm.'
    const ModeIcon = isDark ? Moon : Sun

    return (
      <div className="setting-field logo-field">
        <span><ModeIcon size={18} /><strong>{label}</strong></span>
        <small>{hint}</small>
        <div className="logo-upload-area">
          {current ? (
            <div className={`logo-preview-container ${isDark ? 'dark-preview' : 'light-preview'}`}>
              <img className="logo-preview" src={assetUrl(current)} alt={label} />
              <button type="button" className="icon-btn logo-remove-btn" onClick={() => removeLogo(isDark)}><Trash2 size={14} /></button>
            </div>
          ) : (
            <div className="upload-box logo-upload-box" onClick={() => ref.current?.click()}>
              <ImageUp size={28} />
              <strong>Click để tải {isDark ? 'logo dark' : 'logo light'}</strong>
              <span>PNG, JPG, SVG — tối đa 10MB</span>
            </div>
          )}
          <input ref={ref} type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, isDark)} style={{ display: 'none' }} />
          {current && <button type="button" className="secondary-btn logo-change-btn" onClick={() => ref.current?.click()}>
            <ImageUp size={16} /> Đổi logo
          </button>}
          {isUploading && <span className="logo-uploading">Đang tải lên...</span>}
        </div>
      </div>
    )
  }

  return (
    <form className="quote-form settings-form" onSubmit={onSave}>
      {/* Logo Upload Sections */}
      <div className="logo-uploads-row">
        {renderLogoUpload(false)}
        {renderLogoUpload(true)}
      </div>

      {fields.map(({ field, label, icon: Icon, hint, isTextarea }) => (
        <label className="setting-field" key={field}>
          <span><Icon size={18} /><strong>{label}</strong></span>
          <small>{hint}</small>
          {isTextarea
            ? <textarea name={field} defaultValue={settings?.[field] || ''} rows={3} placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>' />
            : <input name={field} defaultValue={settings?.[field] || ''} />
          }
        </label>
      ))}
      <button className="primary-btn"><Save size={16} /> Lưu cấu hình</button>
    </form>
  )
}
