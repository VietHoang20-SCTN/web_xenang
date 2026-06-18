import React, { useRef, useState, useEffect } from 'react'
import {
  Bold, Calendar, Edit, Eye, EyeOff, Heading2, Heading3,
  ImageUp, Italic, Link, List, ListOrdered, Plus, Save,
  Strikethrough, Trash2, Underline, Upload, X
} from 'lucide-react'
import { api, assetUrl } from '../api'
import { notify } from '../toast'

const empty = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: [], isPublished: false }

export default function AdminBlog({ posts, onRefresh }) {
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('write') // 'write' | 'preview'
  const editorRef = useRef(null)

  const reset = () => { setForm(empty); setEditing(false); setShowForm(false); setTagInput(''); setActiveTab('write') }
  const newPost = () => { setForm({ ...empty }); setEditing(false); setShowForm(true); setTagInput(''); setActiveTab('write') }

  const edit = (post) => {
    setForm({ ...post, tags: post.tags || [] })
    setEditing(true)
    setShowForm(true)
    setActiveTab('write')
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
    if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] })
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

  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    if (editorRef.current) setForm(prev => ({ ...prev, content: editorRef.current.innerHTML }))
  }

  const insertImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const result = await api('/upload/product-image', { method: 'POST', body: fd, headers: {} })
      const imgUrl = assetUrl(result.url)
      const editor = editorRef.current
      if (!editor) return
      editor.focus()
      // Restore cursor position if selection is outside editor
      const sel = window.getSelection()
      let range
      if (sel && sel.rangeCount > 0) {
        range = sel.getRangeAt(0)
        // If selection is outside the editor, place cursor at end
        if (!editor.contains(range.commonAncestorContainer)) {
          range = document.createRange()
          range.selectNodeContents(editor)
          range.collapse(false)
        }
      } else {
        range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
      }
      // Create image element with default styling
      const img = document.createElement('img')
      img.src = imgUrl
      img.alt = 'Blog image'
      img.style.width = '50%'
      img.style.height = 'auto'
      img.style.borderRadius = '8px'
      img.style.objectFit = 'cover'
      // Insert image and move cursor after it
      range.insertNode(img)
      range.setStartAfter(img)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      // Sync content to state
      setForm(prev => ({ ...prev, content: editor.innerHTML }))
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
      setForm(prev => ({ ...prev, content: editorRef.current.innerHTML }))
    }
  }

  // Sync contentEditable HTML when opening editor (new post or edit post)
  // or when switching back to Write tab from Preview tab
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = form.content || ''
    }
  }, [showForm, activeTab])

  const isFormValid = Boolean(
    form.title.trim() &&
    form.slug.trim() &&
    form.excerpt.trim() &&
    form.coverImage &&
    form.content && form.content !== '<br>' && form.content.replace(/<[^>]*>/g, '').trim() !== ''
  )

  const confirmPublish = () => {
    const overlay = document.createElement('div')
    overlay.className = 'blog-confirm-overlay'
    overlay.innerHTML = `
      <div class="blog-confirm-card">
        <h3>Xác nhận đăng bài</h3>
        <p>Bài viết đã đủ thông tin. Bạn muốn:</p>
        <div class="blog-confirm-actions">
          <button class="primary-btn" id="btn-publish"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Xuất bản ngay</button>
          <button class="secondary-btn" id="btn-draft"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> Lưu thành bản nháp</button>
          <button class="blog-confirm-cancel" id="btn-cancel">Hủy</button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    return new Promise((resolve) => {
      overlay.querySelector('#btn-publish').onclick = () => { overlay.remove(); resolve(true) }
      overlay.querySelector('#btn-draft').onclick = () => { overlay.remove(); resolve(false) }
      overlay.querySelector('#btn-cancel').onclick = () => { overlay.remove(); resolve(null) }
      overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(null) } }
    })
  }

  const save = async (e) => {
    e.preventDefault()
    if (!isFormValid) return
    const shouldPublish = await confirmPublish()
    if (shouldPublish === null) return
    const payload = { ...form, isPublished: shouldPublish }
    try {
      if (editing) {
        await api('/admin/blog/' + form.id, { method: 'PUT', body: JSON.stringify(payload) })
        notify.success('Đã cập nhật bài viết.')
      } else {
        await api('/admin/blog', { method: 'POST', body: JSON.stringify(payload) })
        notify.success(shouldPublish ? 'Bài viết đã được xuất bản!' : 'Bài viết đã được lưu thành bản nháp.')
      }
      reset()
      onRefresh()
    } catch (err) {
      notify.error(err.message)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div className="admin-section">
      {/* ── Header ── */}
      <div className="blog-admin-header">
        <div className="blog-admin-header-left">
          <h2>Quản lý Blog</h2>
          <span className="blog-admin-count">{posts?.length || 0} bài viết</span>
        </div>
        <button className="primary-btn blog-new-btn" onClick={newPost}>
          <Plus size={20} /> Viết bài mới
        </button>
      </div>

      {/* ── Editor Form ── */}
      {showForm && (
        <div className="blog-editor-overlay">
          <div className="blog-editor-card">
            {/* Card Header */}
            <div className="blog-editor-header">
              <div className="blog-editor-header-left">
                <div className="blog-editor-icon">
                  <Edit size={20} />
                </div>
                <div>
                  <h3>{editing ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}</h3>
                  <p>{editing ? 'Cập nhật nội dung bài viết hiện tại' : 'Tạo bài viết mới để thu hút khách hàng'}</p>
                </div>
              </div>
              <button type="button" className="blog-editor-close" onClick={reset}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save}>
              <div className="blog-editor-body">
                {/* ── Left Column: Metadata ── */}
                <div className="blog-editor-sidebar">
                  {/* Cover Image */}
                  <div className="blog-editor-section">
                    <label className="blog-editor-section-label">Ảnh bìa</label>
                    <div className="blog-cover-upload" onClick={() => !form.coverImage && document.getElementById('blog-cover-input')?.click()}>
                      {form.coverImage ? (
                        <div className="blog-cover-preview">
                          <img src={assetUrl(form.coverImage)} alt="Cover" />
                          <div className="blog-cover-actions">
                            <button type="button" className="blog-cover-action-btn" onClick={() => document.getElementById('blog-cover-input')?.click()}>
                              <Upload size={14} /> Đổi ảnh
                            </button>
                            <button type="button" className="blog-cover-action-btn danger" onClick={() => setForm({ ...form, coverImage: '' })}>
                              <Trash2 size={14} /> Xóa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="blog-cover-placeholder">
                          <ImageUp size={32} />
                          <span>{uploading ? 'Đang tải lên...' : 'Tải ảnh bìa lên'}</span>
                          <small>Kích thước khuyến nghị: 1200×630px</small>
                        </div>
                      )}
                      <input id="blog-cover-input" type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="blog-editor-section">
                    <label className="blog-editor-section-label">Thẻ (Tags)</label>
                    <div className="blog-tag-input-wrap">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Thêm thẻ..."
                      />
                      <button type="button" onClick={addTag} className="blog-tag-add-btn">+</button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="blog-tag-cloud">
                        {form.tags.map(t => (
                          <span key={t} className="blog-tag-pill">
                            {t}
                            <button type="button" onClick={() => removeTag(t)}><X size={11} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Publish Toggle */}
                  <div className="blog-editor-section">
                    <label className="blog-editor-section-label">Trạng thái</label>
                    <button
                      type="button"
                      className={`blog-publish-toggle ${form.isPublished ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                    >
                      {form.isPublished ? (
                        <><Eye size={16} /> Đã xuất bản</>
                      ) : (
                        <><EyeOff size={16} /> Bản nháp</>
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Right Column: Content ── */}
                <div className="blog-editor-main">
                  {/* Title */}
                  <div className="blog-editor-section">
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || '' })}
                      placeholder="Tiêu đề bài viết..."
                      className="blog-title-field"
                    />
                  </div>

                  {/* Slug */}
                  <div className="blog-editor-section">
                    <div className="blog-slug-row">
                      <span className="blog-slug-prefix">/blog/</span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        placeholder="slug-bai-viet"
                        className="blog-slug-field"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="blog-editor-section">
                    <textarea
                      rows={2}
                      value={form.excerpt || ''}
                      onChange={e => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Mô tả ngắn — hiển thị trong danh sách bài viết và kết quả tìm kiếm..."
                      className="blog-excerpt-field"
                    />
                  </div>

                  {/* Rich Text Editor */}
                  <div className="blog-editor-section">
                    <div className="blog-editor-tabs">
                      <button type="button" className={`blog-editor-tab ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>
                        <Edit size={14} /> Viết
                      </button>
                      <button type="button" className={`blog-editor-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
                        <Eye size={14} /> Xem trước
                      </button>
                    </div>

                    {activeTab === 'write' ? (
                      <div className="blog-rich-editor">
                        <div className="blog-rich-toolbar">
                          <div className="blog-toolbar-group">
                            <button type="button" onClick={() => execCmd('bold')} title="In đậm (Ctrl+B)"><Bold size={15} /></button>
                            <button type="button" onClick={() => execCmd('italic')} title="In nghiêng (Ctrl+I)"><Italic size={15} /></button>
                            <button type="button" onClick={() => execCmd('underline')} title="Gạch chân (Ctrl+U)"><Underline size={15} /></button>
                            <button type="button" onClick={() => execCmd('strikeThrough')} title="Gạch ngang"><Strikethrough size={15} /></button>
                          </div>
                          <div className="blog-toolbar-group">
                            <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} title="Tiêu đề lớn"><Heading2 size={15} /></button>
                            <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} title="Tiêu đề nhỏ"><Heading3 size={15} /></button>
                          </div>
                          <div className="blog-toolbar-group">
                            <button type="button" onClick={() => execCmd('insertUnorderedList')} title="Danh sách"><List size={15} /></button>
                            <button type="button" onClick={() => execCmd('insertOrderedList')} title="Danh sách số"><ListOrdered size={15} /></button>
                          </div>
                          <div className="blog-toolbar-group">
                            <button type="button" onClick={insertLink} title="Chèn liên kết"><Link size={15} /></button>
                            <label className="blog-toolbar-upload-btn" title="Chèn ảnh">
                              <ImageUp size={15} />
                              <input type="file" accept="image/*" onChange={insertImage} hidden />
                            </label>
                          </div>
                        </div>
                        <div
                          ref={editorRef}
                          className="blog-rich-content"
                          contentEditable
                          suppressContentEditableWarning
                          onInput={handleContentChange}
                          onBlur={() => { if (editorRef.current) setForm(prev => ({ ...prev, content: editorRef.current.innerHTML })) }}
                          data-placeholder="Bắt đầu viết nội dung..."
                        />
                      </div>
                    ) : (
                      <div className="blog-preview-pane">
                        {form.content ? (
                          <div className="blog-preview-content" dangerouslySetInnerHTML={{ __html: form.content }} />
                        ) : (
                          <div className="blog-preview-empty">
                            <Edit size={32} />
                            <p>Chưa có nội dung. Hãy viết gì đó trong tab "Viết".</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Footer Actions ── */}
              <div className="blog-editor-footer">
                <button type="button" className="secondary-btn" onClick={reset}>
                  Hủy bỏ
                </button>
                <button type="submit" className={'primary-btn blog-save-btn' + (isFormValid ? '' : ' disabled')} disabled={!isFormValid}>
                  <Save size={18} />
                  {editing ? 'Cập nhật bài viết' : 'Đăng bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Posts List ── */}
      <div className="blog-posts-list">
        {posts?.length === 0 && !showForm && (
          <div className="blog-empty-state">
            <div className="blog-empty-icon"><Edit size={40} /></div>
            <h3>Chưa có bài viết nào</h3>
            <p>Bắt đầu viết bài đầu tiên để thu hút khách hàng từ Google.</p>
            <button className="primary-btn" onClick={newPost}><Plus size={18} /> Viết bài đầu tiên</button>
          </div>
        )}

        {posts?.map(post => (
          <div key={post.id} className="blog-post-item">
            {post.coverImage ? (
              <div className="blog-post-item-image">
                <img src={assetUrl(post.coverImage)} alt={post.title} />
              </div>
            ) : (
              <div className="blog-post-item-image placeholder">
                <ImageUp size={24} />
              </div>
            )}
            <div className="blog-post-item-body">
              <div className="blog-post-item-meta">
                <span className={`blog-post-status ${post.isPublished ? 'published' : 'draft'}`}>
                  {post.isPublished ? 'Đã đăng' : 'Nháp'}
                </span>
                <span className="blog-post-date">
                  <Calendar size={13} /> {formatDate(post.createdAt)}
                </span>
              </div>
              <h4>{post.title}</h4>
              {post.excerpt && <p>{post.excerpt}</p>}
              <div className="blog-post-item-tags">
                {(post.tags || []).map(t => <span key={t} className="blog-post-tag">{t}</span>)}
              </div>
            </div>
            <div className="blog-post-item-actions">
              <button className="icon-btn" onClick={() => edit(post)} title="Chỉnh sửa"><Edit size={16} /></button>
              <button className="icon-btn danger" onClick={() => remove(post.id)} title="Xóa"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
