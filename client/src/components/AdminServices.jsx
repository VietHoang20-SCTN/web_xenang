import React, { useState } from 'react'
import { Edit3, Save, Settings, Trash2 } from 'lucide-react'
import { api } from '../api'
import { emptyService, serviceIcons, serviceIconLabels } from '../constants'
import { notify, confirmDialog } from '../toast'

export default function AdminServices({ services, onRefresh }) {
  const [serviceForm, setServiceForm] = useState(emptyService)

  const editService = (service) => setServiceForm({
    id: service.id, title: service.title || '', slug: service.slug || '',
    description: service.description || '', content: service.content || '',
    icon: service.icon || 'Settings', sortOrder: service.sortOrder || 0,
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
        <textarea placeholder="Nội dung chi tiết (hỗ trợ HTML)" rows={5} value={serviceForm.content} onChange={(e) => setServiceForm({ ...serviceForm, content: e.target.value })} />

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
                <span className="service-list-icon"><Icon size={18} /></span>
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
    </div>
  )
}
