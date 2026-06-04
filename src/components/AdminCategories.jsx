import React, { useState } from 'react'
import { Edit3, Plus, Save, Trash2 } from 'lucide-react'
import { api } from '../api'
import { emptyCategory } from '../constants'

export default function AdminCategories({ categories, onRefresh }) {
  const [categoryForm, setCategoryForm] = useState(emptyCategory)

  const editCategory = (category) => setCategoryForm({
    id: category.id, name: category.name || '', slug: category.slug || '',
    description: category.description || '', sortOrder: category.sortOrder || 0, isActive: category.isActive ?? true
  })
  const saveCategory = async (event) => {
    event.preventDefault()
    if (categoryForm.id) await api(`/admin/categories/${categoryForm.id}`, { method: 'PUT', body: JSON.stringify(categoryForm) })
    else await api('/admin/categories', { method: 'POST', body: JSON.stringify(categoryForm) })
    setCategoryForm(emptyCategory); onRefresh()
  }
  const deleteCategory = async (id) => { if (confirm('Xóa danh mục này?')) { await api(`/admin/categories/${id}`, { method: 'DELETE' }); onRefresh() } }

  return (
    <div className="admin-crud">
      <form className="quote-form" onSubmit={saveCategory}>
        <h3><Plus /> {categoryForm.id ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
        <input required placeholder="Tên danh mục" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
        <input placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
        <textarea placeholder="Mô tả" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
        <button className="primary-btn"><Save size={16} /> {categoryForm.id ? 'Cập nhật danh mục' : 'Lưu danh mục'}</button>
        {categoryForm.id && <button type="button" className="secondary-btn" onClick={() => setCategoryForm(emptyCategory)}>Hủy sửa</button>}
      </form>
      <div className="admin-panel">
        <h3>Danh mục</h3>
        {categories.map((c) => (
          <div className="lead-row" key={c.id}>
            <div><strong>{c.name}</strong><small>{c.slug}</small></div>
            <div className="row-actions">
              <button className="icon-btn" onClick={() => editCategory(c)}><Edit3 size={16} /></button>
              <button className="icon-btn" onClick={() => deleteCategory(c.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
