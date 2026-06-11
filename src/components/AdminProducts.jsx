import React, { useState } from 'react'
import { BarChart3, Edit3, ImageUp, Plus, Save, Trash2 } from 'lucide-react'
import { api, assetUrl, uploadProductImage } from '../api'
import { emptyProduct } from '../constants'
import { notify, confirmDialog } from '../toast'

export default function AdminProducts({ products, categories, onRefresh }) {
  const [productForm, setProductForm] = useState(emptyProduct)
  const [uploading, setUploading] = useState(false)

  const setSpec = (index, value) => setProductForm({ ...productForm, specs: productForm.specs.map((spec, i) => i === index ? value : spec) })
  const addSpec = () => setProductForm({ ...productForm, specs: [...productForm.specs, ''] })
  const removeSpec = (index) => setProductForm({ ...productForm, specs: productForm.specs.filter((_, i) => i !== index) })

  const uploadImage = async (file) => {
    setUploading(true)
    try {
      const result = await uploadProductImage(file)
      setProductForm({ ...productForm, image: result.url })
      notify.success('Đã tải ảnh sản phẩm.')
    } catch (error) {
      notify.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const uploadGalleryImages = async (files) => {
    const selectedFiles = Array.from(files || [])
    if (!selectedFiles.length) return
    setUploading(true)
    try {
      const uploadedImages = []
      for (const file of selectedFiles) { const result = await uploadProductImage(file); uploadedImages.push(result.url) }
      setProductForm({ ...productForm, gallery: [...(productForm.gallery || []), ...uploadedImages] })
      notify.success(`Đã tải ${uploadedImages.length} ảnh chi tiết.`)
    } catch (error) {
      notify.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const editProduct = (product) => setProductForm({
    id: product.id, name: product.name || '', slug: product.slug || '', categoryId: product.categoryId || '',
    tag: product.tag || '', image: product.image || '', gallery: product.gallery || [],
    summary: product.summary || '', specs: product.specs?.length ? product.specs : [''], isActive: product.isActive ?? true
  })

  const saveProduct = async (event) => {
    event.preventDefault()
    const payload = { ...productForm, specs: productForm.specs.filter(Boolean) }
    try {
      if (productForm.id) await api(`/admin/products/${productForm.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      else await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) })
      notify.success(productForm.id ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm mới.')
      setProductForm(emptyProduct); onRefresh()
    } catch (error) {
      notify.error(error.message)
    }
  }

  const deleteProduct = async (id) => {
    if (!(await confirmDialog('Xóa sản phẩm này?'))) return
    try {
      await api(`/admin/products/${id}`, { method: 'DELETE' })
      notify.success('Đã xóa sản phẩm.')
      onRefresh()
    } catch (error) {
      notify.error(error.message)
    }
  }

  return (
    <div className="admin-crud">
      <form className="quote-form" onSubmit={saveProduct}>
        <h3><Plus /> {productForm.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
        <input required placeholder="Tên sản phẩm" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
        <input placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} />
        <select required value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>
          <option value="">Chọn danh mục</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Tag" value={productForm.tag} onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })} />
        <label className="upload-box">
          <ImageUp /><strong>{uploading ? 'Đang nén & tải ảnh...' : 'Chọn ảnh sản phẩm'}</strong><span>Ảnh lớn sẽ tự resize và nén WebP</span>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
        </label>
        {productForm.image && <img className="image-preview" src={assetUrl(productForm.image)} alt="Ảnh sản phẩm" />}
        <label className="upload-box">
          <ImageUp /><strong>Thêm ảnh chi tiết sản phẩm</strong><span>Có thể chọn nhiều ảnh và upload một lần</span>
          <input type="file" accept="image/*" multiple onChange={(e) => uploadGalleryImages(e.target.files)} />
        </label>
        {productForm.gallery?.length > 0 && (
          <div className="gallery-editor">{productForm.gallery.map((image) => (
            <div className="gallery-item" key={image}>
              <img src={assetUrl(image)} alt="Ảnh chi tiết" />
              <button type="button" className="icon-btn" onClick={() => setProductForm({ ...productForm, gallery: productForm.gallery.filter((item) => item !== image) })}><Trash2 size={16} /></button>
            </div>
          ))}</div>
        )}
        <textarea placeholder="Mô tả ngắn" value={productForm.summary} onChange={(e) => setProductForm({ ...productForm, summary: e.target.value })} />
        <div className="spec-editor">
          <strong>Thông số kỹ thuật</strong>
          {productForm.specs.map((spec, index) => (
            <div className="spec-row" key={index}>
              <input placeholder="VD: Tải trọng: 2.000 kg" value={spec} onChange={(e) => setSpec(index, e.target.value)} />
              <button type="button" className="icon-btn" onClick={() => removeSpec(index)}><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" className="secondary-btn" onClick={addSpec}><Plus size={16} /> Thêm thông số</button>
        </div>
        <button className="primary-btn"><Save size={16} /> {productForm.id ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}</button>
        {productForm.id && <button type="button" className="secondary-btn" onClick={() => setProductForm(emptyProduct)}>Hủy sửa</button>}
      </form>
      <div className="admin-panel">
        <h3><BarChart3 /> Danh sách sản phẩm</h3>
        {products.map((p) => (
          <div className="lead-row" key={p.id}>
            <div><strong>{p.name}</strong><small>{p.category?.name} - {p.slug}</small></div>
            <div className="row-actions">
              <button className="icon-btn" onClick={() => editProduct(p)}><Edit3 size={16} /></button>
              <button className="icon-btn" onClick={() => deleteProduct(p.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
