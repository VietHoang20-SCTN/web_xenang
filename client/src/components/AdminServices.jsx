import React, { useState } from 'react'
import { Edit3, ImageUp, Save, Settings, Trash2, X } from 'lucide-react'
import { api, assetUrl, uploadProductImage, uploadServiceImage } from '../api'
import { emptyService, serviceIcons, serviceIconLabels } from '../constants'
import { notify, confirmDialog } from '../toast'
import RichTextEditor from './RichTextEditor'
import ImageCropper from './ImageCropper'

export default function AdminServices({ services, onRefresh }) {
  const [serviceForm, setServiceForm] = useState(emptyService)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [cropFile, setCropFile] = useState(null)

  const editService = (service) => setServiceForm({
    id: service.id, title: service.title || '', slug: service.slug || '',
    description: service.description || '', content: service.content || '',
    image: service.image || '', icon: service.icon || 'Settings', sortOrder: service.sortOrder || 0,
    isActive: service.isActive ?? true
  })
  const saveService = async (event) => {
    event.preventDefault()
    try {
      if (serviceForm.id) await api(`/admin/services/${serviceForm.id}`, { method: 'PUT', body: JSON.stringify(serviceForm) })
      else await api('/admin/services', { method: 'POST', body: JSON.stringify(serviceForm) })
      notify.success(serviceForm.id ? 'Đã cập nhật dịch vụ.' : 'Đã tạo dịch vụ mới.')
      setServiceForm(emptyService); onRefresh()
    } catch (error) {
      notify.error(error.message)
    }
  }
  const uploadInlineImage = async (file) => {
    try {
      const result = await uploadProductImage(file)
      notify.success('Đã chèn ảnh vào nội dung dịch vụ.')
      return assetUrl(result.url)
    } catch (error) {
      notify.error(error.message)
      return null
    }
  }

  const uploadCoverImage = async (file) => {
    if (!file) return
    setCropFile(null)
    setUploadingImage(true)
    try {
      const result = await uploadServiceImage(file)
      setServiceForm((current) => ({ ...current, image: result.url }))
      notify.success('Đã tải ảnh đại diện dịch vụ.')
    } catch (error) {
      notify.error(error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const deleteService = async (id) => {
    if (!(await confirmDialog('Xóa dịch vụ này?'))) return
    try {
      await api(`/admin/services/${id}`, { method: 'DELETE' })
      notify.success('Đã xóa dịch vụ.')
      onRefresh()
    } catch (error) {
      notify.error(error.message)
    }
  }

  return (
    <div className="admin-crud">
      <form className="quote-form" onSubmit={saveService}>
        <h3><Settings /> {serviceForm.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h3>
        <input required placeholder="Tên dịch vụ" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} />
        <input placeholder="Slug" value={serviceForm.slug} onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })} />
        <input type="number" placeholder="Thứ tự" value={serviceForm.sortOrder} onChange={(e) => setServiceForm({ ...serviceForm, sortOrder: e.target.value })} />
        <textarea placeholder="Mô tả ngắn" rows={2} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
        <div className="service-image-field">
          <div className="service-image-field-heading">
            <div>
              <strong>Ảnh đại diện dịch vụ</strong>
              <small>Khung ngang 16:10, xuất 1280 × 800 px; JPG, PNG hoặc WebP, tối đa 10 MB.</small>
            </div>
            {serviceForm.image && (
              <button type="button" className="icon-btn" aria-label="Xóa ảnh dịch vụ" onClick={() => setServiceForm({ ...serviceForm, image: '' })}>
                <X size={16} />
              </button>
            )}
          </div>
          <label className={`service-image-upload${uploadingImage ? ' uploading' : ''}`}>
            {serviceForm.image ? (
              <>
                <img src={assetUrl(serviceForm.image)} alt="Xem trước ảnh dịch vụ" />
                <span className="service-image-change"><ImageUp size={20} /><strong>Thay ảnh</strong></span>
              </>
            ) : (
              <span><ImageUp size={28} /><strong>{uploadingImage ? 'Đang tải ảnh...' : 'Chọn ảnh dịch vụ'}</strong><small>Bạn có thể kéo và thu phóng trước khi lưu</small></span>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage} aria-label={serviceForm.image ? 'Thay ảnh dịch vụ' : 'Chọn ảnh dịch vụ'} onChange={(e) => { setCropFile(e.target.files?.[0] || null); e.target.value = '' }} />
          </label>
        </div>
        <section className="product-content-editor service-content-editor" aria-labelledby="service-content-title">
          <header className="product-content-editor-header">
            <div>
              <span className="product-content-editor-kicker">Trình soạn thảo nâng cao</span>
              <strong id="service-content-title">Nội dung chi tiết dịch vụ</strong>
              <small>Định dạng nội dung, chèn ảnh và bảng trực tiếp.</small>
            </div>
            <span className="product-content-editor-tip">Thanh công cụ luôn hiển thị</span>
          </header>
          <RichTextEditor
            value={serviceForm.content}
            onChange={(content) => setServiceForm((prev) => ({ ...prev, content }))}
            placeholder="Nhập nội dung chi tiết dịch vụ..."
            onUploadImage={uploadInlineImage}
          />
        </section>

        {/* Visual Icon Picker */}
        <div className="icon-picker">
          <label className="icon-picker-label">Chọn biểu tượng</label>
          <div className="icon-picker-grid">
            {Object.entries(serviceIcons).map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                className={`icon-picker-item ${serviceForm.icon === name ? 'selected' : ''}`}
                onClick={() => setServiceForm({ ...serviceForm, icon: name })}
                title={serviceIconLabels[name] || name}
              >
                <Icon size={22} />
                <span>{serviceIconLabels[name] || name}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="primary-btn"><Save size={16} /> {serviceForm.id ? 'Cập nhật dịch vụ' : 'Lưu dịch vụ'}</button>
        {serviceForm.id && <button type="button" className="secondary-btn" onClick={() => setServiceForm(emptyService)}>Hủy sửa</button>}
      </form>
      <div className="admin-panel">
        <h3>Dịch vụ</h3>
        {services.map((s) => {
          const Icon = serviceIcons[s.icon] || Settings
          return (
            <div className="lead-row" key={s.id}>
              <div className="service-list-item">
                {s.image ? <img className="service-list-image" src={assetUrl(s.image)} alt="" /> : <span className="service-list-icon"><Icon size={18} /></span>}
                <div>
                  <strong>{s.title}</strong>
                  <small>{s.slug}</small>
                </div>
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => editService(s)}><Edit3 size={16} /></button>
                <button className="icon-btn" onClick={() => deleteService(s.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          )
        })}
      </div>
      {cropFile && (
        <ImageCropper
          file={cropFile}
          aspectRatio={16 / 10}
          outputWidth={1280}
          outputHeight={800}
          title="Chọn vùng ảnh dịch vụ (16:10)"
          onCancel={() => setCropFile(null)}
          onConfirm={uploadCoverImage}
        />
      )}
    </div>
  )
}
