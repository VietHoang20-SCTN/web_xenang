import React, { useState } from 'react'
import { Edit, Plus, Save, Trash2, X } from 'lucide-react'
import { api, assetUrl } from '../api'
import { notify } from '../toast'

const empty = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: [], isPublished: false }

export default function AdminBlog({ posts, onRefresh }) {
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const reset = () => { setForm(empty); setEditing(false); setShowForm(false); setTagInput('') }

  const newPost = () => { setForm({ ...empty }); setEditing(false); setShowForm(true); setTagInput('') }

  const edit = (post) => {
    setForm({ ...post, tags: post.tags || [] })
    setEditing(true)
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api(`/admin/blog/${form.id}`, { method: 'PUT', body: JSON.stringify(form) })
        notify.success('Đã cập nhật bài viết.')
      } else {
        await api('/admin/blog', { method: 'POST', body: JSON.stringify(form) })
        notify.success('Đã tạo bài viết mới.')
      }
      reset()
      onRefresh()
    } catch (err) {
      notify.error(err.message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Xóa bài viết này?')) return
    try {
      await api(`/admin/blog/${id}`, { method: 'DELETE' })
      notify.success('Đã xóa.')
      onRefresh()
    } catch (err) {
      notify.error(err.message)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] })
    }
    setTagInput('')
  }

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const result = await api('/upload/product-image', { method: 'POST', body: fd, headers: {} })
      setForm({ ...form, coverImage: result.url })
      notify.success('Đã upload ảnh bìa.')
    } catch (err) {
      notify.error(err.message)
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <h3>Quản lý Blog ({posts?.length || 0} bài)</h3>
        <button className="primary-btn" onClick={newPost}><Plus size={18} /> Viết bài mới</button>
      </div>

      {showForm && (
        <form className="admin-form blog-form" onSubmit={save}>
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Tiêu đề</label>
              <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề bài viết" />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="tu-dong-tao" />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả ngắn (excerpt)</label>
            <textarea rows={2} value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Tóm tắt bài viết..." />
          </div>

          <div className="form-group">
            <label>Nội dung (HTML)</label>
            <textarea rows={10} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="<h2>Tiêu đề</h2><p>Nội dung...</p>" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ảnh bìa</label>
              <div className="image-upload-row">
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {form.coverImage && <img src={assetUrl(form.coverImage)} alt="Cover" className="upload-preview" />}
              </div>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-row">
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Thêm tag..." />
                <button type="button" className="secondary-btn" onClick={addTag}>Thêm</button>
              </div>
              <div className="tag-list">
                {form.tags.map(t => (
                  <span key={t} className="tag-chip">{t} <button type="button" onClick={() => removeTag(t)}><X size={12} /></button></span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row form-actions">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
              Xuất bản
            </label>
            <div className="form-buttons">
              <button type="button" className="secondary-btn" onClick={reset}>Hủy</button>
              <button type="submit" className="primary-btn"><Save size={18} /> {editing ? 'Cập nhật' : 'Đăng bài'}</button>
            </div>
          </div>
        </form>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Slug</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts?.map(post => (
              <tr key={post.id}>
                <td className="td-title">{post.title}</td>
                <td><code>{post.slug}</code></td>
                <td><span className={`status-badge ${post.isPublished ? 'published' : 'draft'}`}>{post.isPublished ? 'Đã đăng' : 'Nháp'}</span></td>
                <td>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="td-actions">
                  <button className="icon-btn" onClick={() => edit(post)}><Edit size={16} /></button>
                  <button className="icon-btn danger" onClick={() => remove(post.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
