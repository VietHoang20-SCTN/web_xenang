import React, { useState } from 'react'
import { Building2, Phone, Search, X } from 'lucide-react'
import { api } from '../api'
import { leadStatuses } from '../constants'
import { notify, confirmDialog } from '../toast'

export default function AdminLeads({ leads, onRefresh }) {
  const [leadSearch, setLeadSearch] = useState('')
  const [leadStatus, setLeadStatus] = useState('ALL')
  const [selectedLead, setSelectedLead] = useState(null)

  const filteredLeads = leads.filter((lead) => {
    const text = `${lead.name} ${lead.phone} ${lead.company || ''} ${lead.need}`.toLowerCase()
    return (leadStatus === 'ALL' || lead.status === leadStatus) && text.includes(leadSearch.toLowerCase())
  })

  const updateLead = async (id, status, note) => {
    try {
      await api(`/admin/leads/${id}`, { method: 'PUT', body: JSON.stringify({ status, note }) })
      notify.success('Đã cập nhật lead.')
      setSelectedLead(null)
      onRefresh()
    } catch (error) {
      notify.error(error.message)
    }
  }
  const deleteLead = async (id) => {
    if (!(await confirmDialog('Xóa lead này?'))) return
    try {
      await api(`/admin/leads/${id}`, { method: 'DELETE' })
      notify.success('Đã xóa lead.')
      setSelectedLead(null)
      onRefresh()
    } catch (error) {
      notify.error(error.message)
    }
  }

  return (
    <div className="lead-admin">
      <div className="lead-overview">
        <div><span className="eyebrow">Quản lý lead</span><h3>Theo dõi yêu cầu tư vấn từ website</h3><p>Tìm kiếm, phân loại trạng thái và mở chi tiết để cập nhật ghi chú chăm sóc khách hàng.</p></div>
        <div className="lead-stat"><strong>{filteredLeads.length}</strong><span>Lead đang hiển thị</span></div>
        <div className="lead-stat"><strong>{leads.length}</strong><span>Tổng lead</span></div>
      </div>
      <div className="lead-toolbar">
        <label className="lead-search"><Search size={18} /><input placeholder="Tìm theo tên, SĐT, công ty hoặc nhu cầu..." value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} /></label>
        <select value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(leadStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="kanban-grid">
        {Object.entries(leadStatuses).map(([status, label]) => {
          const statusLeads = filteredLeads.filter((lead) => lead.status === status)
          return (
            <div className={`kanban-column status-${status.toLowerCase()}`} key={status}>
              <div className="kanban-column-head"><h3>{label}</h3><span>{statusLeads.length}</span></div>
              {statusLeads.length === 0 && <div className="kanban-empty">Chưa có lead</div>}
              {statusLeads.map((lead) => (
                <button className="kanban-card" key={lead.id} onClick={() => setSelectedLead(lead)}>
                  <div className="kanban-card-head"><strong>{lead.name || 'Khách chưa nhập tên'}</strong><span>{leadStatuses[lead.status]}</span></div>
                  <p><Phone size={15} />{lead.phone}</p>
                  <p><Building2 size={15} />{lead.company || 'Chưa có công ty'}</p>
                  <small>{lead.need || 'Chưa ghi nhu cầu'}</small>
                  <time>{new Date(lead.createdAt).toLocaleDateString('vi-VN')}</time>
                </button>
              ))}
            </div>
          )
        })}
      </div>
      {selectedLead && (
        <div className="modal-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="lead-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn modal-close" onClick={() => setSelectedLead(null)}><X /></button>
            <h2>{selectedLead.name}</h2>
            <p><Phone size={16} /> {selectedLead.phone}</p>
            <p><Building2 size={16} /> {selectedLead.company || 'Chưa có công ty'}</p>
            <p>{selectedLead.need}</p>
            <select value={selectedLead.status} onChange={(e) => setSelectedLead({ ...selectedLead, status: e.target.value })}>
              {Object.entries(leadStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <textarea placeholder="Ghi chú nội bộ" value={selectedLead.note || ''} onChange={(e) => setSelectedLead({ ...selectedLead, note: e.target.value })} />
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => updateLead(selectedLead.id, selectedLead.status, selectedLead.note)}>Lưu lead</button>
              <button className="secondary-btn" onClick={() => deleteLead(selectedLead.id)}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
