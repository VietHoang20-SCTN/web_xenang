import React, { useRef, useState } from 'react'
import { ImageUp, Moon, Save, Sun, Trash2 } from 'lucide-react'
import { api, assetUrl, uploadLogo } from '../api'
import { notify } from '../toast'

export default function AdminSettings({ settings, onRefresh }) {
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoDarkPreview, setLogoDarkPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingDark, setUploadingDark] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const fileDarkRef = useRef(null)

  const onSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    const form = event.target
    const data = {
      brand: form.brand.value, hotline: form.hotline.value, zalo: form.zalo.value,
      email: form.email.value, address: form.address.value, mapEmbed: form.mapEmbed.value,
      heroTitle: form.heroTitle.value, heroSubtitle: form.heroSubtitle.value,
      logo: logoPreview !== null ? logoPreview : (settings?.logo || null),
      logoDark: logoDarkPreview !== null ? logoDarkPreview : (settings?.logoDark || null)
    }
    try {
      await api('/admin/site-settings', { method: 'PUT', body: JSON.stringify(data) })
      notify.success('Đã lưu cấu hình thành công!')
      onRefresh()
    } catch (error) {
      notify.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event, isDark = false) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      isDark ? setUploadingDark(true) : setUploading(true)
      const result = await uploadLogo(file)
      isDark ? setLogoDarkPreview(result.url) : setLogoPreview(result.url)
      notify.success('Đã tải logo lên!')
    } catch (error) {
      notify.error(error.message)
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

  return (
    <form className="st" onSubmit={onSave}>
      {/* Page header */}
      <div className="st-header">
        <h2>Cấu hình website</h2>
        <p>Quản lý nội dung, thông tin liên hệ và nhận diện thương hiệu.</p>
      </div>

      {/* Section: Hero / Trang chủ */}
      <section className="st-card">
        <div className="st-card-title">
          <span className="st-dot st-dot--blue" />
          <h3>Nội dung trang chủ</h3>
        </div>
        <div className="st-fields">
          <div className="st-field">
            <label htmlFor="heroTitle">Tiêu đề chính</label>
            <input id="heroTitle" name="heroTitle" defaultValue={settings?.heroTitle || ''} placeholder="VD: Giải pháp xe nâng điện và thiết bị kho cho doanh nghiệp logistics." />
          </div>
          <div className="st-field">
            <label htmlFor="heroSubtitle">Mô tả phụ</label>
            <input id="heroSubtitle" name="heroSubtitle" defaultValue={settings?.heroSubtitle || ''} placeholder="VD: Bán & cho thuê xe nâng, phụ tùng, sửa chữa tại Bắc Ninh." />
          </div>
        </div>
      </section>

      {/* Section: Liên hệ */}
      <section className="st-card">
        <div className="st-card-title">
          <span className="st-dot st-dot--amber" />
          <h3>Thông tin liên hệ</h3>
        </div>
        <div className="st-fields">
          <div className="st-field">
            <label htmlFor="brand">Tên thương hiệu</label>
            <input id="brand" name="brand" defaultValue={settings?.brand || ''} placeholder="Xe Nâng Bắc Ninh" />
          </div>
          <div className="st-grid-2">
            <div className="st-field">
              <label htmlFor="hotline">Hotline</label>
              <input id="hotline" name="hotline" defaultValue={settings?.hotline || ''} placeholder="0900 000 000" />
            </div>
            <div className="st-field">
              <label htmlFor="zalo">Link Zalo</label>
              <input id="zalo" name="zalo" defaultValue={settings?.zalo || ''} placeholder="https://zalo.me/..." />
            </div>
          </div>
          <div className="st-grid-2">
            <div className="st-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" defaultValue={settings?.email || ''} placeholder="contact@example.vn" />
            </div>
            <div className="st-field">
              <label htmlFor="address">Địa chỉ</label>
              <input id="address" name="address" defaultValue={settings?.address || ''} placeholder="Bắc Ninh, Việt Nam" />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Bản đồ */}
      <section className="st-card">
        <div className="st-card-title">
          <span className="st-dot st-dot--green" />
          <h3>Bản đồ</h3>
        </div>
        <div className="st-fields">
          <div className="st-field">
            <label htmlFor="mapEmbed">Mã nhúng Google Maps</label>
            <textarea id="mapEmbed" name="mapEmbed" defaultValue={settings?.mapEmbed || ''} rows={3} placeholder='Dán mã <iframe src="https://www.google.com/maps/embed?..." ...></iframe>' />
            <span className="st-hint">Mở Google Maps → Chia sẻ → Nhúng bản đồ → Sao chép mã HTML</span>
          </div>
        </div>
      </section>

      {/* Section: Logo */}
      <section className="st-card">
        <div className="st-card-title">
          <span className="st-dot st-dot--purple" />
          <h3>Logo thương hiệu</h3>
        </div>
        <div className="st-fields">
          <div className="st-logo-grid">
            {/* Light logo */}
            <div className="st-logo-slot">
              <div className="st-logo-label"><Sun size={14} /> Light Mode</div>
              {currentLogo ? (
                <div className="st-logo-preview st-logo-preview--light">
                  <img src={assetUrl(currentLogo)} alt="Logo light" />
                  <button type="button" className="st-logo-remove" onClick={() => removeLogo(false)}><Trash2 size={12} /></button>
                </div>
              ) : (
                <div className="st-logo-drop" onClick={() => fileRef.current?.click()}>
                  <ImageUp size={22} />
                  <span>Tải logo lên</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, false)} hidden />
              {currentLogo && <button type="button" className="st-logo-change" onClick={() => fileRef.current?.click()}>Đổi logo</button>}
              {uploading && <span className="st-uploading">Đang tải...</span>}
            </div>

            {/* Dark logo */}
            <div className="st-logo-slot">
              <div className="st-logo-label"><Moon size={14} /> Dark Mode</div>
              {currentLogoDark ? (
                <div className="st-logo-preview st-logo-preview--dark">
                  <img src={assetUrl(currentLogoDark)} alt="Logo dark" />
                  <button type="button" className="st-logo-remove" onClick={() => removeLogo(true)}><Trash2 size={12} /></button>
                </div>
              ) : (
                <div className="st-logo-drop" onClick={() => fileDarkRef.current?.click()}>
                  <ImageUp size={22} />
                  <span>Tải logo lên</span>
                </div>
              )}
              <input ref={fileDarkRef} type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, true)} hidden />
              {currentLogoDark && <button type="button" className="st-logo-change" onClick={() => fileDarkRef.current?.click()}>Đổi logo</button>}
              {uploadingDark && <span className="st-uploading">Đang tải...</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="st-save">
        <button className="st-save-btn" disabled={saving}>
          {saving ? <><span className="spinner-sm" /> Đang lưu...</> : <><Save size={16} /> Lưu cấu hình</>}
        </button>
      </div>
    </form>
  )
}
