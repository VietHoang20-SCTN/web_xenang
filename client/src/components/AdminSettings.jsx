import React, { useRef, useState } from 'react'
import {
  ImageUp,
  Moon,
  Save,
  Sun,
  Trash2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Factory,
  ShieldCheck,
  PackageCheck,
  Truck,
  Zap,
  Settings,
  Users,
  Building2,
} from 'lucide-react'
import { api, assetUrl, uploadLogo, uploadAboutImage } from '../api'
import { notify } from '../toast'

export default function AdminSettings({ settings, onRefresh }) {
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoDarkPreview, setLogoDarkPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingDark, setUploadingDark] = useState(false)
  const [aboutImages, setAboutImages] = useState(null) // null = use settings value
  const [uploadingAbout, setUploadingAbout] = useState(false)
  const [saving, setSaving] = useState(false)
  const [heroMetrics, setHeroMetrics] = useState(null)
  const [trustBadges, setTrustBadges] = useState(null)
  const [aboutAudience, setAboutAudience] = useState(null)
  const fileRef = useRef(null)
  const fileDarkRef = useRef(null)
  const aboutFileRef = useRef(null)

  const onSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    const form = event.target
    const data = {
      brand: form.brand.value,
      hotline: form.hotline.value,
      zalo: form.zalo.value,
      email: form.email.value,
      address: form.address.value,
      mapEmbed: form.mapEmbed.value,
      heroTitle: form.heroTitle.value,
      heroSubtitle: form.heroSubtitle.value,
      aboutTitle: form.aboutTitle.value,
      aboutBody: form.aboutBody.value,
      aboutImage: (aboutImages !== null ? aboutImages[0] : settings?.aboutImages?.[0]) || null,
      aboutImages: aboutImages !== null ? aboutImages : settings?.aboutImages || [],
      aboutAudience: {
        title: form.aboutAudienceTitle?.value ?? settings?.aboutAudience?.title ?? '',
        intro: form.aboutAudienceIntro?.value ?? settings?.aboutAudience?.intro ?? '',
        bullets: aboutAudience !== null ? aboutAudience.bullets : settings?.aboutAudience?.bullets || [],
      },
      logo: logoPreview !== null ? logoPreview : settings?.logo || null,
      logoDark: logoDarkPreview !== null ? logoDarkPreview : settings?.logoDark || null,
      heroMetrics: heroMetrics !== null ? heroMetrics : settings?.heroMetrics || [],
      trustBadges: trustBadges !== null ? trustBadges : settings?.trustBadges || [],
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

  const handleAboutImageUpload = async (event) => {
    const files = event.target.files
    if (!files?.length) return
    try {
      setUploadingAbout(true)
      const current = aboutImages !== null ? [...aboutImages] : [...(settings?.aboutImages || [])]
      for (const file of files) {
        const result = await uploadAboutImage(file)
        current.push(result.url)
      }
      setAboutImages(current)
      notify.success(`Đã tải ${files.length} ảnh lên!`)
    } catch (error) {
      notify.error(error.message)
    } finally {
      setUploadingAbout(false)
      if (aboutFileRef.current) aboutFileRef.current.value = ''
    }
  }

  const removeAboutImage = (index) => {
    const current = aboutImages !== null ? [...aboutImages] : [...(settings?.aboutImages || [])]
    current.splice(index, 1)
    setAboutImages(current)
  }

  const moveAboutImage = (index, direction) => {
    const current = aboutImages !== null ? [...aboutImages] : [...(settings?.aboutImages || [])]
    const target = index + direction
    if (target < 0 || target >= current.length) return
    ;[current[index], current[target]] = [current[target], current[index]]
    setAboutImages(current)
  }

  const currentAboutImages = aboutImages !== null ? aboutImages : settings?.aboutImages || []
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
            <input
              id="heroTitle"
              name="heroTitle"
              defaultValue={settings?.heroTitle || ''}
              placeholder="VD: Giải pháp xe nâng điện và thiết bị kho cho doanh nghiệp logistics."
            />
          </div>
          <div className="st-field">
            <label htmlFor="heroSubtitle">Mô tả phụ</label>
            <input
              id="heroSubtitle"
              name="heroSubtitle"
              defaultValue={settings?.heroSubtitle || ''}
              placeholder="VD: Bán & cho thuê xe nâng, phụ tùng, sửa chữa tại Bắc Ninh."
            />
          </div>
        </div>
      </section>

      {/* Section: Hero Metrics (dynamic, max 6) */}
      <section className="st-card">
        <div className="st-card-title">
          <span className="st-dot st-dot--green" />
          <h3>Chỉ số hero</h3>
          <span className="st-hint" style={{ marginLeft: 'auto', fontSize: 12 }}>
            Tối đa 6. Bỏ trống cả số & nhãn → không hiển thị
          </span>
        </div>
        <div className="st-fields">
          {(() => {
            const items = heroMetrics !== null ? heroMetrics : settings?.heroMetrics || []
            return items.map((m, i) => (
              <div
                className="st-grid-2"
                key={i}
                style={{
                  gridTemplateColumns: '1fr 1fr auto',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: 12,
                  marginBottom: 8,
                }}
              >
                <div className="st-field" style={{ marginBottom: 0 }}>
                  <label>Số hiển thị #{i + 1}</label>
                  <input
                    value={m.number || ''}
                    onChange={(e) => {
                      const arr = items.map((x) => ({ ...x }))
                      arr[i].number = e.target.value
                      setHeroMetrics(arr)
                    }}
                    placeholder="VD: 24+"
                  />
                </div>
                <div className="st-field" style={{ marginBottom: 0 }}>
                  <label>Nhãn #{i + 1}</label>
                  <input
                    value={m.label || ''}
                    onChange={(e) => {
                      const arr = items.map((x) => ({ ...x }))
                      arr[i].label = e.target.value
                      setHeroMetrics(arr)
                    }}
                    placeholder="VD: Nhóm sản phẩm chủ lực"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setHeroMetrics(items.filter((_, j) => j !== i))}
                  style={{
                    alignSelf: 'end',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: 'var(--danger)',
                  }}
                  title="Xoá"
                >
                  ✕
                </button>
              </div>
            ))
          })()}
          <button
            type="button"
            disabled={(heroMetrics ?? settings?.heroMetrics ?? []).length >= 6}
            onClick={() =>
              setHeroMetrics([
                ...(heroMetrics !== null ? heroMetrics : settings?.heroMetrics || []),
                { number: '', label: '' },
              ])
            }
            style={{
              background: 'none',
              border: '1px dashed var(--border)',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
              width: '100%',
              color: 'var(--text)',
            }}
          >
            + Thêm chỉ số
          </button>
        </div>
      </section>

      {/* Section: Trust Badges (dynamic, max 6) */}
      <section className="st-card">
        <div className="st-card-title">
          <span className="st-dot st-dot--amber" />
          <h3>Badge tin cậy</h3>
          <span className="st-hint" style={{ marginLeft: 'auto', fontSize: 12 }}>
            Tối đa 6. Bỏ trống → không hiển thị
          </span>
        </div>
        <div className="st-fields">
          {(() => {
            const items = trustBadges !== null ? trustBadges : settings?.trustBadges || []
            return items.map((b, i) => (
              <div
                className="st-grid-2"
                key={i}
                style={{
                  gridTemplateColumns: '1fr 1fr auto',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: 12,
                  marginBottom: 8,
                }}
              >
                <div className="st-field" style={{ marginBottom: 0 }}>
                  <label>Icon #{i + 1}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { key: 'Factory', icon: Factory },
                      { key: 'ShieldCheck', icon: ShieldCheck },
                      { key: 'PackageCheck', icon: PackageCheck },
                      { key: 'Truck', icon: Truck },
                      { key: 'Zap', icon: Zap },
                      { key: 'Settings', icon: Settings },
                      { key: 'Users', icon: Users },
                      { key: 'Building2', icon: Building2 },
                    ].map(({ key, icon: IconComp }) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => {
                          const arr = items.map((x) => ({ ...x }))
                          arr[i].icon = arr[i].icon === key ? '' : key
                          setTrustBadges(arr)
                        }}
                        title={key}
                        style={{
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all .15s',
                          border: (b.icon || '') === key ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: (b.icon || '') === key ? 'rgba(251,191,36,.15)' : 'var(--bg-card)',
                          color: (b.icon || '') === key ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        <IconComp size={20} />
                      </button>
                    ))}
                    {b.icon &&
                    ![
                      'Factory',
                      'ShieldCheck',
                      'PackageCheck',
                      'Truck',
                      'Zap',
                      'Settings',
                      'Users',
                      'Building2',
                    ].includes(b.icon) ? (
                      <button
                        type="button"
                        onClick={() => {
                          const arr = items.map((x) => ({ ...x }))
                          arr[i].icon = ''
                          setTrustBadges(arr)
                        }}
                        style={{
                          width: 44,
                          height: 44,
                          border: '2px solid var(--danger)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          color: 'var(--danger)',
                          fontSize: 18,
                          background: 'var(--bg-card)',
                        }}
                        title="Xoá icon"
                      >
                        ✕
                      </button>
                    ) : null}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="st-field" style={{ marginBottom: 0 }}>
                    <label>Tiêu đề #{i + 1}</label>
                    <input
                      value={b.title || ''}
                      onChange={(e) => {
                        const arr = items.map((x) => ({ ...x }))
                        arr[i].title = e.target.value
                        setTrustBadges(arr)
                      }}
                      placeholder="VD: Logistics & fulfillment"
                    />
                  </div>
                  <div className="st-field" style={{ marginBottom: 0 }}>
                    <label>Mô tả #{i + 1}</label>
                    <input
                      value={b.desc || ''}
                      onChange={(e) => {
                        const arr = items.map((x) => ({ ...x }))
                        arr[i].desc = e.target.value
                        setTrustBadges(arr)
                      }}
                      placeholder="VD: Phù hợp kho vận, trung tâm phân phối."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrustBadges(items.filter((_, j) => j !== i))}
                  style={{
                    alignSelf: 'end',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: 'var(--danger)',
                  }}
                  title="Xoá"
                >
                  ✕
                </button>
              </div>
            ))
          })()}
          <button
            type="button"
            disabled={(trustBadges ?? settings?.trustBadges ?? []).length >= 6}
            onClick={() =>
              setTrustBadges([
                ...(trustBadges !== null ? trustBadges : settings?.trustBadges || []),
                { title: '', desc: '' },
              ])
            }
            style={{
              background: 'none',
              border: '1px dashed var(--border)',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
              width: '100%',
              color: 'var(--text)',
            }}
          >
            + Thêm badge
          </button>
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
              <input
                id="address"
                name="address"
                defaultValue={settings?.address || ''}
                placeholder="Bắc Ninh, Việt Nam"
              />
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
            <textarea
              id="mapEmbed"
              name="mapEmbed"
              defaultValue={settings?.mapEmbed || ''}
              rows={3}
              placeholder='Dán mã <iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
            />
            <span className="st-hint">Mở Google Maps → Chia sẻ → Nhúng bản đồ → Sao chép mã HTML</span>
          </div>
        </div>
      </section>

      {/* Section: Giới thiệu */}
      <section className="st-card">
        <div className="st-card-title">
          <span className="st-dot st-dot--blue" />
          <h3>Giới thiệu</h3>
        </div>
        <div className="st-fields">
          <div className="st-field">
            <label htmlFor="aboutTitle">Tiêu đề</label>
            <input
              id="aboutTitle"
              name="aboutTitle"
              defaultValue={settings?.aboutTitle || ''}
              placeholder="VD: Website B2B cho doanh nghiệp có hoạt động kho tại miền Bắc."
            />
          </div>
          <div className="st-field">
            <label htmlFor="aboutBody">Nội dung chi tiết</label>
            <textarea
              id="aboutBody"
              name="aboutBody"
              defaultValue={settings?.aboutBody || ''}
              rows={10}
              placeholder="Nhập nội dung giới thiệu... Có thể dùng HTML."
            />
          </div>
          <div className="st-field">
            <label>Khách hàng mục tiêu (gạch đầu dòng)</label>
            <span className="st-hint" style={{ display: 'block', marginBottom: 8 }}>
              Mỗi dòng là một gạch đầu dòng hiển thị trên trang chủ. Bỏ trống tiêu đề → không hiển thị card này.
            </span>
            <div className="st-field" style={{ marginBottom: 8 }}>
              <input
                name="aboutAudienceTitle"
                defaultValue={settings?.aboutAudience?.title || 'Khách hàng mục tiêu'}
                placeholder="Tiêu đề card (VD: Khách hàng mục tiêu)"
              />
            </div>
            <div className="st-field" style={{ marginBottom: 8 }}>
              <textarea
                name="aboutAudienceIntro"
                rows={2}
                defaultValue={settings?.aboutAudience?.intro || ''}
                placeholder="Mô tả ngắn phía trên danh sách (không bắt buộc)"
              />
            </div>
            {(() => {
              const items = aboutAudience !== null ? aboutAudience : settings?.aboutAudience || { bullets: [] }
              return (
                <>
                  {items.bullets.map((b, i) => (
                    <div
                      key={i}
                      className="st-grid-2"
                      style={{
                        gridTemplateColumns: '1fr auto',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div className="st-field" style={{ marginBottom: 0 }}>
                        <label>Gạch đầu dòng #{i + 1}</label>
                        <input
                          value={b || ''}
                          onChange={(e) => {
                            const next = items.bullets.map((x, j) => (j === i ? e.target.value : x))
                            setAboutAudience({ ...items, bullets: next })
                          }}
                          placeholder="VD: Doanh nghiệp logistics và fulfillment"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setAboutAudience({
                            ...items,
                            bullets: items.bullets.filter((_, j) => j !== i),
                          })
                        }
                        style={{
                          alignSelf: 'end',
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          padding: '6px 10px',
                          cursor: 'pointer',
                          color: 'var(--danger)',
                        }}
                        title="Xoá"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={(aboutAudience ?? settings?.aboutAudience ?? { bullets: [] }).bullets.length >= 20}
                    onClick={() =>
                      setAboutAudience({
                        ...items,
                        bullets: [...items.bullets, ''],
                      })
                    }
                    style={{
                      background: 'none',
                      border: '1px dashed var(--border)',
                      borderRadius: 6,
                      padding: '8px 16px',
                      cursor: 'pointer',
                      width: '100%',
                      color: 'var(--text)',
                    }}
                  >
                    + Thêm gạch đầu dòng
                  </button>
                </>
              )
            })()}
          </div>
          <div className="st-field">
            <label>Ảnh giới thiệu (có thể tải nhiều ảnh)</label>
            <div className="st-about-gallery">
              {currentAboutImages.length > 0 ? (
                <div className="st-about-gallery-grid">
                  {currentAboutImages.map((img, i) => (
                    <div className="st-about-gallery-item" key={`${img}-${i}`}>
                      <img src={assetUrl(img)} alt={`Ảnh ${i + 1}`} />
                      <button
                        type="button"
                        className="st-logo-remove"
                        onClick={() => removeAboutImage(i)}
                        title="Xoá ảnh"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="st-about-gallery-move">
                        <button type="button" disabled={i === 0} onClick={() => moveAboutImage(i, -1)}>
                          <ChevronLeft size={12} />
                        </button>
                        <span>
                          {i + 1}/{currentAboutImages.length}
                        </span>
                        <button
                          type="button"
                          disabled={i === currentAboutImages.length - 1}
                          onClick={() => moveAboutImage(i, 1)}
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="st-about-gallery-actions">
                <button type="button" className="st-about-add-btn" onClick={() => aboutFileRef.current?.click()}>
                  <ImageIcon size={16} /> Thêm ảnh
                </button>
                <input
                  ref={aboutFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAboutImageUpload}
                  hidden
                />
                {uploadingAbout && <span className="st-uploading">Đang tải...</span>}
              </div>
            </div>
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
              <div className="st-logo-label">
                <Sun size={14} /> Light Mode
              </div>
              {currentLogo ? (
                <div className="st-logo-preview st-logo-preview--light">
                  <img src={assetUrl(currentLogo)} alt="Logo light" />
                  <button type="button" className="st-logo-remove" onClick={() => removeLogo(false)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <div className="st-logo-drop" onClick={() => fileRef.current?.click()}>
                  <ImageUp size={22} />
                  <span>Tải logo lên</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, false)} hidden />
              {currentLogo && (
                <button type="button" className="st-logo-change" onClick={() => fileRef.current?.click()}>
                  Đổi logo
                </button>
              )}
              {uploading && <span className="st-uploading">Đang tải...</span>}
            </div>

            {/* Dark logo */}
            <div className="st-logo-slot">
              <div className="st-logo-label">
                <Moon size={14} /> Dark Mode
              </div>
              {currentLogoDark ? (
                <div className="st-logo-preview st-logo-preview--dark">
                  <img src={assetUrl(currentLogoDark)} alt="Logo dark" />
                  <button type="button" className="st-logo-remove" onClick={() => removeLogo(true)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <div className="st-logo-drop" onClick={() => fileDarkRef.current?.click()}>
                  <ImageUp size={22} />
                  <span>Tải logo lên</span>
                </div>
              )}
              <input
                ref={fileDarkRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, true)}
                hidden
              />
              {currentLogoDark && (
                <button type="button" className="st-logo-change" onClick={() => fileDarkRef.current?.click()}>
                  Đổi logo
                </button>
              )}
              {uploadingDark && <span className="st-uploading">Đang tải...</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="st-save">
        <button className="st-save-btn" disabled={saving}>
          {saving ? (
            <>
              <span className="spinner-sm" /> Đang lưu...
            </>
          ) : (
            <>
              <Save size={16} /> Lưu cấu hình
            </>
          )}
        </button>
      </div>
    </form>
  )
}
