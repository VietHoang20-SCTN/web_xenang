import React, { useEffect, useRef, useState } from 'react'
import { Calendar, Edit, Eye, EyeOff, ImageUp, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { api, assetUrl } from '../api'
import { notify } from '../toast'
import BlogArticle from './BlogArticle'
import RichTextEditor from './RichTextEditor'

const empty = { title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: [], isPublished: true }

export default function AdminBlog({ posts, onRefresh }) {
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('write')
  const coverInputRef = useRef(null)
  const dialogRef = useRef(null)
  const titleInputRef = useRef(null)
  const triggerRef = useRef(null)
  const savingRef = useRef(false)
  const togglingRef = useRef(new Set())
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    if (showForm) {
      titleInputRef.current?.focus()
      return
    }
    triggerRef.current?.focus()
    triggerRef.current = null
  }, [showForm])

  const reset = () => {
    setForm(empty)
    setEditing(false)
    setShowForm(false)
    setTagInput('')
    setActiveTab('write')
  }

  const closeForm = () => {
    if (!savingRef.current) reset()
  }

  const newPost = (event) => {
    triggerRef.current = event.currentTarget
    setForm({ ...empty, tags: [] })
    setEditing(false)
    setShowForm(true)
    setTagInput('')
    setActiveTab('write')
  }

  const edit = (post, event) => {
    triggerRef.current = event.currentTarget
    setForm({ ...post, tags: post.tags || [] })
    setEditing(true)
    setShowForm(true)
    setTagInput('')
    setActiveTab('write')
  }

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeForm()
      return
    }
    if (event.key !== 'Tab') return

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
      ) || []
    ).filter((element) => element.offsetParent !== null)
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
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

  const togglePublished = async (post) => {
    if (togglingRef.current.has(post.id)) return
    togglingRef.current.add(post.id)
    setTogglingId(post.id)
    const isPublished = !post.isPublished
    try {
      await api(`/admin/blog/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...post, isPublished }),
      })
      notify.success(isPublished ? 'Đã xuất bản bài viết.' : 'Đã chuyển bài viết về bản nháp.')
      onRefresh()
    } catch (err) {
      notify.error(err.message)
    } finally {
      togglingRef.current.delete(post.id)
      setTogglingId(null)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag) setForm((prev) => (prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] }))
    setTagInput('')
  }

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((currentTag) => currentTag !== tag) }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append('image', file)
    try {
      const result = await api('/upload/product-image', { method: 'POST', body: data, headers: {} })
      setForm((prev) => ({ ...prev, coverImage: result.url }))
      notify.success('Đã upload ảnh bìa.')
    } catch (err) {
      notify.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const uploadInlineImage = async (file) => {
    const data = new FormData()
    data.append('image', file)
    try {
      const result = await api('/upload/product-image', { method: 'POST', body: data, headers: {} })
      notify.success('Đã chèn ảnh.')
      return assetUrl(result.url)
    } catch (err) {
      notify.error(err.message)
      return null
    }
  }

  const isFormValid = Boolean(
    form.title.trim() &&
    form.slug.trim() &&
    form.excerpt.trim() &&
    form.coverImage &&
    form.content &&
    form.content !== '<br>' &&
    form.content.replace(/<[^>]*>/g, '').trim() !== ''
  )

  const save = async (event) => {
    event.preventDefault()
    if (savingRef.current || !isFormValid) return

    savingRef.current = true
    setSaving(true)
    const payload = { ...form }
    try {
      if (editing) {
        await api('/admin/blog/' + form.id, { method: 'PUT', body: JSON.stringify(payload) })
        notify.success('Đã cập nhật bài viết.')
      } else {
        await api('/admin/blog', { method: 'POST', body: JSON.stringify(payload) })
        notify.success(form.isPublished ? 'Bài viết đã được xuất bản!' : 'Bài viết đã được lưu thành bản nháp.')
      }
      reset()
      onRefresh()
    } catch (err) {
      notify.error(err.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })

  const submitLabel = saving
    ? 'Đang lưu...'
    : editing
      ? 'Cập nhật bài viết'
      : form.isPublished
        ? 'Xuất bản bài viết'
        : 'Lưu bản nháp'

  return (
    <div className="admin-section">
      <div className="blog-admin-header">
        <div className="blog-admin-header-left">
          <h2>Quản lý Blog</h2>
          <span className="blog-admin-count">{posts?.length || 0} bài viết</span>
        </div>
        <button className="primary-btn blog-new-btn" onClick={newPost}>
          <Plus size={20} /> Viết bài mới
        </button>
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(event) => event.target === event.currentTarget && closeForm()}
        >
          <div
            ref={dialogRef}
            className="blog-editor-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-editor-title"
            onKeyDown={handleDialogKeyDown}
          >
            <div className="blog-editor-header">
              <div className="blog-editor-header-left">
                <div className="blog-editor-icon">
                  <Edit size={20} />
                </div>
                <div>
                  <h3 id="blog-editor-title">{editing ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}</h3>
                  <p>{editing ? 'Cập nhật nội dung bài viết hiện tại' : 'Tạo bài viết mới để thu hút khách hàng'}</p>
                </div>
              </div>
              <button
                type="button"
                className="blog-editor-close"
                onClick={closeForm}
                aria-label="Đóng trình soạn thảo bài viết"
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save}>
              <div className="blog-editor-body">
                <div className="blog-editor-sidebar">
                  <div className="blog-editor-section">
                    <label className="blog-editor-section-label" htmlFor="blog-cover-input">
                      Ảnh bìa
                    </label>
                    <div className="blog-cover-upload">
                      {form.coverImage ? (
                        <div className="blog-cover-preview">
                          <img src={assetUrl(form.coverImage)} alt="Ảnh bìa bài viết" />
                          <div className="blog-cover-actions">
                            <button
                              type="button"
                              className="blog-cover-action-btn"
                              onClick={() => coverInputRef.current?.click()}
                            >
                              <Upload size={14} /> Đổi ảnh
                            </button>
                            <button
                              type="button"
                              className="blog-cover-action-btn danger"
                              onClick={() => setForm((prev) => ({ ...prev, coverImage: '' }))}
                            >
                              <Trash2 size={14} /> Xóa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="blog-cover-placeholder" htmlFor="blog-cover-input">
                          <ImageUp size={32} />
                          <span>{uploading ? 'Đang tải lên...' : 'Tải ảnh bìa lên'}</span>
                          <small>Kích thước khuyến nghị: 1200×630px</small>
                        </label>
                      )}
                      <input
                        ref={coverInputRef}
                        id="blog-cover-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        aria-label="Chọn ảnh bìa bài viết"
                        hidden
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="blog-editor-section">
                    <label className="blog-editor-section-label" htmlFor="blog-tag-input">
                      Thẻ (Tags)
                    </label>
                    <div className="blog-tag-input-wrap">
                      <input
                        id="blog-tag-input"
                        type="text"
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag())}
                        placeholder="Thêm thẻ..."
                      />
                      <button type="button" onClick={addTag} className="blog-tag-add-btn" aria-label="Thêm thẻ">
                        +
                      </button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="blog-tag-cloud">
                        {form.tags.map((tag) => (
                          <span key={tag} className="blog-tag-pill">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} aria-label={`Xóa thẻ ${tag}`}>
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="blog-editor-section">
                    <label className="blog-editor-section-label">Trạng thái</label>
                    <button
                      type="button"
                      className={`blog-publish-toggle ${form.isPublished ? 'active' : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
                      aria-pressed={form.isPublished}
                    >
                      {form.isPublished ? (
                        <>
                          <Eye size={16} /> Đã xuất bản
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} /> Bản nháp
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="blog-editor-main">
                  <div className="blog-editor-section">
                    <input
                      ref={titleInputRef}
                      type="text"
                      required
                      value={form.title}
                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Tiêu đề bài viết..."
                      className="blog-title-field"
                      aria-label="Tiêu đề bài viết"
                    />
                  </div>

                  <div className="blog-editor-section">
                    <div className="blog-slug-row">
                      <span className="blog-slug-prefix">/blog/</span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                        placeholder="slug-bai-viet"
                        className="blog-slug-field"
                        aria-label="Đường dẫn bài viết"
                      />
                    </div>
                  </div>

                  <div className="blog-editor-section">
                    <textarea
                      rows={2}
                      value={form.excerpt || ''}
                      onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                      placeholder="Mô tả ngắn — hiển thị trong danh sách bài viết và kết quả tìm kiếm..."
                      className="blog-excerpt-field"
                      aria-label="Mô tả ngắn bài viết"
                    />
                  </div>

                  <div className="blog-editor-section">
                    <div className="blog-editor-tabs" role="tablist" aria-label="Chế độ soạn thảo bài viết">
                      <button
                        id="blog-write-tab"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'write'}
                        aria-controls="blog-write-panel"
                        className={`blog-editor-tab ${activeTab === 'write' ? 'active' : ''}`}
                        onClick={() => setActiveTab('write')}
                      >
                        <Edit size={14} /> Viết
                      </button>
                      <button
                        id="blog-preview-tab"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'preview'}
                        aria-controls="blog-preview-panel"
                        className={`blog-editor-tab ${activeTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preview')}
                      >
                        <Eye size={14} /> Xem trước
                      </button>
                    </div>

                    {activeTab === 'write' ? (
                      <div
                        id="blog-write-panel"
                        className="blog-rich-editor"
                        role="tabpanel"
                        aria-labelledby="blog-write-tab"
                      >
                        <RichTextEditor
                          value={form.content}
                          onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                          onUploadImage={uploadInlineImage}
                        />
                      </div>
                    ) : (
                      <div
                        id="blog-preview-panel"
                        className="blog-preview-pane"
                        role="tabpanel"
                        aria-labelledby="blog-preview-tab"
                      >
                        <div className="blog-preview-browser" aria-label="Cửa sổ xem trước bài viết">
                          <div className="blog-preview-browser-bar">
                            <div className="blog-preview-browser-dots" aria-hidden="true">
                              <span />
                              <span />
                              <span />
                            </div>
                            <div className="blog-preview-address">
                              <span>🔒</span> xenangbacninh.vn/blog/{form.slug || 'duong-dan-bai-viet'}
                            </div>
                            <span className="blog-preview-live">Xem trước trực tiếp</span>
                          </div>
                          <div className="blog-preview-viewport">
                            {form.content ? (
                              <BlogArticle
                                post={{
                                  ...form,
                                  title: form.title || 'Tiêu đề bài viết',
                                  excerpt: form.excerpt || 'Mô tả ngắn của bài viết sẽ hiển thị tại đây.',
                                  createdAt: form.createdAt || new Date().toISOString(),
                                }}
                                embedded
                              />
                            ) : (
                              <div className="blog-preview-empty">
                                <Edit size={32} />
                                <p>Chưa có nội dung. Hãy viết gì đó trong tab "Viết".</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="blog-editor-footer">
                <button type="button" className="secondary-btn" onClick={closeForm} disabled={saving}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={'primary-btn blog-save-btn' + (isFormValid && !saving ? '' : ' disabled')}
                  disabled={!isFormValid || saving}
                >
                  <Save size={18} />
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="blog-posts-list">
        {posts?.length === 0 && !showForm && (
          <div className="blog-empty-state">
            <div className="blog-empty-icon">
              <Edit size={40} />
            </div>
            <h3>Chưa có bài viết nào</h3>
            <p>Bắt đầu viết bài đầu tiên để thu hút khách hàng từ Google.</p>
            <button className="primary-btn" onClick={newPost}>
              <Plus size={18} /> Viết bài đầu tiên
            </button>
          </div>
        )}

        {posts?.map((post) => (
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
                {(post.tags || []).map((tag) => (
                  <span key={tag} className="blog-post-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="blog-post-item-actions">
              <button
                type="button"
                className={`blog-list-publish-toggle ${post.isPublished ? 'active' : ''}`}
                onClick={() => togglePublished(post)}
                disabled={togglingId === post.id}
                title={post.isPublished ? 'Chuyển về bản nháp' : 'Xuất bản bài viết'}
                aria-label={`${post.isPublished ? 'Ẩn' : 'Xuất bản'} ${post.title}`}
                aria-pressed={post.isPublished}
              >
                <span aria-hidden="true" />
                {post.isPublished ? 'Đang đăng' : 'Bản nháp'}
              </button>
              <button
                className="icon-btn"
                onClick={(event) => edit(post, event)}
                title="Chỉnh sửa"
                aria-label={`Chỉnh sửa ${post.title}`}
              >
                <Edit size={16} />
              </button>
              <button
                className="icon-btn danger"
                onClick={() => remove(post.id)}
                title="Xóa"
                aria-label={`Xóa ${post.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
