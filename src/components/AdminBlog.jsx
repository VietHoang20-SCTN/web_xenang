import React, { useRef, useState } from 'react'
import { Bold, Edit, Heading1, Heading2, ImageUp, Italic, Link, List, ListOrdered, Plus, Save, Trash2, Underline, X } from 'lucide-react'
import { api, assetUrl } from '../api'
import { notify } from '../toast'

const empty = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: [], isPublished: false }

export default function AdminBlog({ posts, onRefresh }) {
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const editorRef = useRef(null)

  const reset = () => { setForm(empty); setEditing(false); setShowForm(false); setTagInput('') }
  const newPost = () => { setForm({ ...empty }); setEditing(false); setShowForm(true); setTagInput('') }

  const edit = (post) => {
    setForm({ ...post, tags: post.tags || [] })
    setEditing(true)
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return notify.error('Vui lòng nhập tiêu đề.')
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
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const result = await api('/upload/product-image', { method: 'POST', body: fd, headers: {} })
      setForm({ ...form, coverImage: result.url })
      notify.success('Đã upload ảnh bìa.')
    } catch (err) {
      notify.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  // Rich text toolbar actions
  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    if (editorRef.current) {
      setForm({ ...form, content: editorRef.current.innerHTML })
    }
  }

  const insertImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const result = await api('/upload/product-image', { method: 'POST', body: fd, headers: {} })
      execCmd('insertImage', assetUrl(result.url))
      notify.success('Đã chèn ảnh.')
    } catch (err) {
      notify.error(err.message)
    }
  }

  const insertLink = () => {
    const url = prompt('Nhập URL:')
    if (url) execCmd('createLink', url)
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      setForm({ ...form, content: editorRef.current.innerHTML })
    }
  }

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <h3>Quản lý Blog ({posts?.length || 0} bài)</h3>
        <button className="primary-btn" onClick={newPost}><Plus size={18} /> Viết bài mới</button>
      </div>

      {showForm && (
        <form className="admin-form blog-form" onSubmit={save}>
          {/* Title + Slug row */}
          <div className="form-row">
            <div className="form-group flex-3">
              <label>Tiêu đề bài viết</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tiêu đề hấp dẫn..."
                className="blog-title-input"
              />
            </div>
            <div className="form-group flex-1">
              <label>Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="tu-dong-tao"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="form-group">
            <label>Mô tả ngắn</label>
            <textarea
              rows={2}
              value={form.excerpt || ''}
              onChange={e => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Tóm tắt hấp dẫn 1-2 câu để hiển thị trên trang danh sách..."
            />
          </div>

          {/* Cover Image + Tags row */}
          <div className="form-row blog-meta-row">
            <div className="form-group flex-1">
              <label>Ảnh bìa</label>
              <div className="cover-upload-area">
                {form.coverImage ? (
                  <div className="cover-preview">
                    <img src={assetUrl(form.coverImage)} alt="Cover" />
                    <button type="button" className="cover-remove" onClick={() => setForm({ ...form, coverImage: '' })}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cover-upload-label">
                    <ImageUp size={24} />
                    <span>{uploading ? 'Đang upload...' : 'Tải ảnh bìa'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
            <div className="form-group flex-1">
              <label>Tags</label>
              <div className="tag-input-row">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Nhập tag rồi Enter..."
                />
                <button type="button" className="secondary-btn" onClick={addTag}>Thêm</button>
              </div>
              {form.tags.length > 0 && (
                <div className="tag-list">
                  {form.tags.map(t => (
                    <span key={t} className="tag-chip">
                      {t}
                      <button type="button" onClick={() => removeTag(t)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="form-group">
            <label>Nội dung bài viết</label>
            <div className="rich-editor-wrapper">
              <div className="rich-toolbar">
                <button type="button" onClick={() => execCmd('bold')} title="In đậm"><Bold size={16} /></button>
                <button type="button" onClick={() => execCmd('italic')} title="In nghiêng"><Italic size={16} /></button>
                <button type="button" onClick={() => execCmd('underline')} title="Gạch chân"><Underline size={16} /></button>
                <span className="toolbar-divider" />
                <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} title="Heading 2"><Heading2 size={16} /></button>
                <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} title="Heading 3"><Heading1 size={16} /></button>
                <span className="toolbar-divider" />
                <button type="button" onClick={() => execCmd('insertUnorderedList')} title="Danh sách"><List size={16} /></button>
                <button type="button" onClick={() => execCmd('insertOrderedList')} title="Danh sách có thứ tự"><ListOrdered size={16} /></button>
                <span className="toolbar-divider" />
                <button type="button" onClick={insertLink} title="Chèn link"><Link size={16} /></button>
                <label className="toolbar-btn" title="Chèn ảnh">
                  <ImageUp size={16} />
                  <input type="file" accept="image/*" onChange={insertImage} hidden />
                </label>
              </div>
              <div
                ref={editorRef}
                className="rich-editor-content"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: form.content || '' }}
                onInput={handleContentChange}
                onBlur={handleContentChange}
                placeholder="Bắt đầu viết nội dung bài viết..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-row form-actions">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={e => setForm({ ...form, isPublished: e.target.checked })}
              />
              <span>Xuất bản ngay</span>
            </label>
            <div className="form-buttons">
              <button type="button" className="secondary-btn" onClick={reset}>Hủy</button>
              <button type="submit" className="primary-btn">
                <Save size={18} /> {editing ? 'Cập nhật' : 'Đăng bài'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Posts Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Bài viết</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts?.length === 0 && (
              <tr><td colSpan={4} className="empty-cell">Chưa có bài viết nào. Hãy viết bài đầu tiên!</td></tr>
            )}
            {posts?.map(post => (
              <tr key={post.id}>
                <td className="td-title">
                  <div className="blog-table-title">
                    {post.coverImage && <img src={assetUrl(post.coverImage)} alt="" className="blog-table-thumb" />}
                    <div>
                      <strong>{post.title}</strong>
                      <small>{post.slug}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${post.isPublished ? 'published' : 'draft'}`}>
                    {post.isPublished ? 'Đã đăng' : 'Nháp'}
                  </span>
                </td>
                <td className="td-date">{formatDate(post.createdAt)}</td>
                <td className="td-actions">
                  <button className="icon-btn" onClick={() => edit(post)} title="Sửa"><Edit size={16} /></button>
                  <button className="icon-btn danger" onClick={() => remove(post.id)} title="Xóa"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
