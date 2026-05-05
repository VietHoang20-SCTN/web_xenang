import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, BarChart3, Building2, CheckCircle2, ClipboardList, Edit3, Factory, ImageUp, LogOut, Mail, MapPinned, MapPin, Menu, MessageCircle, PackageCheck, Phone, Plus, Save, Search, Settings, ShieldCheck, Trash2, Truck, Users, X, Zap } from 'lucide-react'
import { api, assetUrl, clearToken, getToken, setToken, uploadProductImage } from './api'
import { categories as fallbackCategories, products as fallbackProducts, services as fallbackServices, siteSettings as fallbackSettings } from './data'
import './styles.css'

const emptyProduct = { id: null, name: '', slug: '', categoryId: '', tag: '', image: '', gallery: [], summary: '', specs: [''], isActive: true }
const emptyCategory = { id: null, name: '', slug: '', description: '', sortOrder: 0, isActive: true }
const emptyService = { id: null, title: '', slug: '', description: '', icon: 'Settings', sortOrder: 0, isActive: true }
const leadStatuses = { NEW: 'Mới', CONTACTED: 'Đã liên hệ', QUOTED: 'Đã báo giá', DONE: 'Hoàn tất', CANCELLED: 'Hủy' }
const serviceIcons = { Truck, PackageCheck, Settings, Factory, ShieldCheck, Zap }
const mapEmbedUrl = (url, address) => {
  if (!url) return address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : ''
  const iframeSrc = url.match(/src=["']([^"']+)["']/i)?.[1]
  const mapUrl = iframeSrc || url.trim()
  if (mapUrl.includes('/embed') || mapUrl.includes('output=embed')) return mapUrl
  if (mapUrl.includes('maps.app.goo.gl') || mapUrl.includes('goo.gl/maps')) return ''
  try {
    const parsedUrl = new URL(mapUrl)
    const query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query')
    return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : ''
  } catch {
    return ''
  }
}

const mapOpenUrl = (url, address) => url?.match(/src=["']([^"']+)["']/i)?.[1] || url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

function PublicSite() {
  const [categories, setCategories] = useState(fallbackCategories)
  const [products, setProducts] = useState(fallbackProducts)
  const [serviceItems, setServiceItems] = useState(fallbackServices.map((service, index) => ({ ...service, id: service.title, icon: ['Truck', 'PackageCheck', 'Settings', 'Factory'][index] || 'Settings' })))
  const [siteSettings, setSiteSettings] = useState(fallbackSettings)
  const [activeCategory, setActiveCategory] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', company: '', need: '', productId: '' })
  const [album, setAlbum] = useState(null)
  const [albumIndex, setAlbumIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    Promise.all([api('/public/categories'), api('/public/products'), api('/public/services'), api('/public/site-settings')]).then(([apiCategories, apiProducts, apiServices, apiSettings]) => {
      setCategories(apiCategories || fallbackCategories)
      setProducts(apiProducts || fallbackProducts)
      setServiceItems(apiServices?.length ? apiServices : serviceItems)
      setSiteSettings(apiSettings || fallbackSettings)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [products, categories, serviceItems, activeCategory])

  const filteredProducts = useMemo(() => activeCategory === 'all' ? products : products.filter((product) => product.category?.slug === activeCategory || product.category?.id === activeCategory || product.categoryId === activeCategory), [activeCategory, products])
  const heroImages = useMemo(() => products.map((product) => product.image).filter(Boolean).slice(0, 10), [products])
  const openAlbum = (product, index = 0) => {
    const images = [product.image, ...(product.gallery || [])].filter(Boolean)
    if (!images.length) return
    setAlbum({ product, images })
    setAlbumIndex(index)
  }
  const openProductDetail = (product) => {
    setSelectedProduct(product)
    openAlbum(product, 0)
  }
  const submitLead = async (event) => { event.preventDefault(); const phone = leadForm.phone.replace(/\s/g, ''); if (!leadForm.name.trim() || !leadForm.need.trim()) { alert('Vui lòng nhập họ tên và nhu cầu tư vấn.'); return } if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone)) { alert('Vui lòng nhập số điện thoại Việt Nam hợp lệ, đủ 10 chữ số.'); return } try { await api('/public/leads', { method: 'POST', body: JSON.stringify({ ...leadForm, phone }) }); alert('Cảm ơn bạn. Thông tin đã được ghi nhận, đội ngũ tư vấn sẽ liên hệ lại sớm.'); setLeadForm({ name: '', phone: '', company: '', need: '', productId: '' }) } catch (error) { alert(error.message) } }

  return <>
    <header className="site-header"><a className="brand" href="#home"><Truck size={28} /><span>{siteSettings.brand}</span></a><nav className="desktop-nav"><a href="#products">Sản phẩm</a><a href="#services">Dịch vụ</a><a href="#about">Giới thiệu</a><a href="#contact">Liên hệ</a></nav><div className="header-actions"><a className="phone-link" href={`tel:${siteSettings.hotline}`}><Phone size={18} />{siteSettings.hotline}</a><button className="menu-btn" onClick={() => setMobileMenuOpen(true)}><Menu /></button></div></header>
    {mobileMenuOpen && <div className="mobile-panel"><button className="close-btn" onClick={() => setMobileMenuOpen(false)}><X /></button><a onClick={() => setMobileMenuOpen(false)} href="#products">Sản phẩm</a><a onClick={() => setMobileMenuOpen(false)} href="#services">Dịch vụ</a><a onClick={() => setMobileMenuOpen(false)} href="#contact">Liên hệ</a></div>}
    <main className="snap-main">
      <section id="home" className="hero page-enter"><div className="hero-copy"><span className="eyebrow"><Zap size={16} /> Bán & cho thuê xe nâng tại miền Bắc</span><h1>Giải pháp xe nâng điện và thiết bị kho cho doanh nghiệp logistics.</h1><p>Website B2B tối giản, rõ thông số, CTA nổi bật để khách hàng dễ gọi điện, gửi báo giá hoặc chat Zalo.</p><div className="hero-actions"><a className="primary-btn quote-pulse" href="#quote">Nhận báo giá <ArrowRight size={18} /></a><a className="zalo-icon-btn" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a></div></div><div className="hero-card"><div className="hero-carousel"><div className="hero-carousel-track">{[...heroImages, ...heroImages].map((image, index) => <img key={`${image}-${index}`} src={assetUrl(image)} alt="Hình ảnh sản phẩm xe nâng" />)}</div></div><div className="metric"><strong>{categories.length}+</strong><span>Nhóm sản phẩm chủ lực</span></div><div className="metric"><strong>24h</strong><span>Tiếp nhận yêu cầu tư vấn</span></div><div className="metric"><strong>Miền Bắc</strong><span>Tập trung Bắc Ninh và khu vực lân cận</span></div></div><div className="hero-trust"><div><Factory /><strong>Logistics & fulfillment</strong><span>Phù hợp kho vận, trung tâm phân phối.</span></div><div><ShieldCheck /><strong>Uy tín dịch vụ</strong><span>Có bán, cho thuê, phụ tùng và sửa chữa.</span></div><div><PackageCheck /><strong>Thiết bị kho</strong><span>Tập trung xe nâng điện và warehouse equipment.</span></div></div></section>
      
      <section id="products" className="section reveal"><div className="section-heading"><span>Sản phẩm</span><h2>Danh mục xe nâng trọng tâm</h2><p>Xem nhanh thông số kỹ thuật và gửi yêu cầu tư vấn thuê/mua.</p></div><div className="category-tabs"><button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>Tất cả</button>{categories.map((category) => <button className={activeCategory === (category.slug || category.id) ? 'active' : ''} key={category.id || category.slug} onClick={() => setActiveCategory(category.slug || category.id)}>{category.name}</button>)}</div><div className="product-grid">{filteredProducts.map((product) => <article className="product-card reveal" key={product.id}><button className="product-image-button" onClick={() => openAlbum(product, 0)}><img src={assetUrl(product.image)} alt={product.name} /><span>Xem album</span></button><div className="product-body"><span className="tag">{product.tag}</span><h3>{product.name}</h3><p>{product.summary}</p><div className="product-gallery-slot">{product.gallery?.length > 0 ? <div className="product-thumbs">{product.gallery.slice(0, 4).map((image, index) => <button key={image} onClick={() => openAlbum(product, index + 1)}><img src={assetUrl(image)} alt={`${product.name} chi tiết`} /></button>)}</div> : <div className="no-gallery">Hiện tại không có ảnh chi tiết sản phẩm</div>}</div><ul>{(product.specs || []).slice(0, 4).map((spec) => <li key={spec}><CheckCircle2 size={16} />{spec}</li>)}</ul>{(product.specs || []).length > 4 && <button className="more-link" onClick={() => openProductDetail(product)}>Xem thêm {(product.specs || []).length - 4} thông số</button>}<div className="card-actions"><a href="#quote" onClick={() => setLeadForm({ ...leadForm, productId: product.id, need: `Tư vấn ${product.name}` })}>Nhận báo giá</a><a className="zalo-icon-btn small-zalo" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a></div></div></article>)}</div>{filteredProducts.length === 0 && <div className="empty-state">Chưa có sản phẩm trong danh mục này.</div>}</section>
      <section id="services" className="section alt-section reveal"><div className="section-heading"><span>Dịch vụ</span><h2>Bán, cho thuê, sửa chữa và phụ tùng</h2></div><div className="service-grid">{serviceItems.map((service) => { const Icon = serviceIcons[service.icon] || Settings; return <div className="service-card reveal" key={service.id || service.title}><Icon /><h3>{service.title}</h3><p>{service.description}</p></div> })}</div></section>
      <section id="about" className="about-quote-section reveal"><div className="about-copy"><span className="eyebrow">Định vị thương hiệu</span><h2>Website B2B cho doanh nghiệp có hoạt động kho tại miền Bắc.</h2><p>Thông tin sản phẩm rõ ràng, CTA ngắn gọn, phù hợp khách hàng logistics, fulfillment, kho lạnh và nhà máy.</p><div className="audience-card"><h3>Khách hàng mục tiêu</h3><ul><li>Doanh nghiệp logistics và fulfillment</li><li>Kho lạnh, kho hàng hóa, trung tâm phân phối</li><li>Nhà máy sản xuất có nhu cầu nâng hạ</li></ul></div></div><div id="quote" className="lead-card"><span className="eyebrow"><ClipboardList size={16} /> Form lead</span><h2>Yêu cầu tư vấn thuê/mua xe nâng</h2><p>Form ngắn, tối ưu mobile, lưu trực tiếp vào hệ thống quản trị.</p><form className="quote-form lead-form" onSubmit={submitLead}><label className="input-icon"><Users size={18} /><input required placeholder="Họ tên *" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} /></label><label className="input-icon"><Phone size={18} /><input required inputMode="tel" placeholder="Số điện thoại *" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} /></label><label className="input-icon"><Building2 size={18} /><input placeholder="Công ty (không bắt buộc)" value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} /></label><label className="input-icon textarea-icon"><ClipboardList size={18} /><textarea required placeholder="Nhu cầu *: thuê xe, mua xe, sửa chữa, phụ tùng..." value={leadForm.need} onChange={(e) => setLeadForm({ ...leadForm, need: e.target.value })} /></label><button className="primary-btn" type="submit">Gửi yêu cầu</button></form></div></section><section id="contact" className="section contact-section"><div className="map-card">{mapEmbedUrl(siteSettings.mapEmbed, siteSettings.address) ? <iframe title="Bản đồ" src={mapEmbedUrl(siteSettings.mapEmbed, siteSettings.address)} loading="lazy"></iframe> : <div className="map-fallback"><MapPinned size={34} /><strong>Không thể nhúng trực tiếp link Google Maps này</strong><span>Link rút gọn từ admin vẫn được dùng để mở bản đồ bên ngoài.</span></div>}</div><div className="contact-info"><span>Liên hệ</span><h2>{siteSettings.brand}</h2><p><MapPin size={18} /> {siteSettings.address}</p><p><Phone size={18} /> {siteSettings.hotline}</p><p><Mail size={18} /> {siteSettings.email}</p></div></section>
    </main>{album && <div className="album-modal" onClick={() => { setAlbum(null); setSelectedProduct(null) }}><div className={selectedProduct ? "album-viewer product-detail-modal" : "album-viewer"} onClick={(e) => e.stopPropagation()}><button className="close-btn modal-close" onClick={() => { setAlbum(null); setSelectedProduct(null) }}><X /></button><div><h2>{album.product.name}</h2>{selectedProduct && <p>{album.product.summary}</p>}</div><img className="album-main" src={assetUrl(album.images[albumIndex])} alt={album.product.name} /><div className="album-thumbs">{album.images.map((image, index) => <button className={index === albumIndex ? "active" : ""} key={image} onClick={() => setAlbumIndex(index)}><img src={assetUrl(image)} alt={`${album.product.name} ${index + 1}`} /></button>)}</div>{selectedProduct && <div className="product-detail-content"><h3>Thông số kỹ thuật</h3><ul>{(selectedProduct.specs || []).map((spec) => <li key={spec}><CheckCircle2 size={16} />{spec}</li>)}</ul><div className="hero-actions"><a className="primary-btn" href="#quote" onClick={() => { setLeadForm({ ...leadForm, productId: selectedProduct.id, need: `Tư vấn ${selectedProduct.name}` }); setAlbum(null); setSelectedProduct(null) }}>Nhận báo giá</a><a className="zalo-icon-btn small-zalo" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a></div></div>}</div></div>}<div className="floating-actions"><a href={`tel:${siteSettings.hotline}`}><Phone size={20} /> Gọi</a><a className="zalo-icon-btn small-zalo" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a></div><footer> 2026 {siteSettings.brand}. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.</footer>
  </>
}

function AdminApp() {
  const [token, updateToken] = useState(getToken())
  const [login, setLogin] = useState({ email: 'admin@xenang.local', password: 'Admin@123456' })
  const [tab, setTab] = useState('products')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [leads, setLeads] = useState([])
  const [settings, setSettings] = useState({ brand: '', hotline: '', zalo: '', email: '', address: '', mapEmbed: '' })
  const [productForm, setProductForm] = useState(emptyProduct)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [serviceForm, setServiceForm] = useState(emptyService)
  const [uploading, setUploading] = useState(false)
  const [leadSearch, setLeadSearch] = useState('')
  const [leadStatus, setLeadStatus] = useState('ALL')
  const [selectedLead, setSelectedLead] = useState(null)

  const loadAdmin = async () => {
    const [adminCategories, adminProducts, adminServices, adminLeads, adminSettings] = await Promise.all([api('/admin/categories'), api('/admin/products'), api('/admin/services'), api('/admin/leads'), api('/admin/site-settings')])
    setCategories(adminCategories); setProducts(adminProducts); setServices(adminServices); setLeads(adminLeads); setSettings(adminSettings || settings)
  }
  useEffect(() => { if (token) loadAdmin().catch((error) => alert(error.message)) }, [token])

  const filteredLeads = leads.filter((lead) => { const text = `${lead.name} ${lead.phone} ${lead.company || ''} ${lead.need}`.toLowerCase(); return (leadStatus === 'ALL' || lead.status === leadStatus) && text.includes(leadSearch.toLowerCase()) })
  const setSpec = (index, value) => setProductForm({ ...productForm, specs: productForm.specs.map((spec, i) => i === index ? value : spec) })
  const addSpec = () => setProductForm({ ...productForm, specs: [...productForm.specs, ''] })
  const removeSpec = (index) => setProductForm({ ...productForm, specs: productForm.specs.filter((_, i) => i !== index) })
  const uploadImage = async (file) => { setUploading(true); try { const result = await uploadProductImage(file); setProductForm({ ...productForm, image: result.url }) } finally { setUploading(false) } }; const uploadGalleryImages = async (files) => { const selectedFiles = Array.from(files || []); if (!selectedFiles.length) return; setUploading(true); try { const uploadedImages = []; for (const file of selectedFiles) { const result = await uploadProductImage(file); uploadedImages.push(result.url) } setProductForm({ ...productForm, gallery: [...(productForm.gallery || []), ...uploadedImages] }) } finally { setUploading(false) } }
  const doLogin = async (event) => { event.preventDefault(); const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(login) }); setToken(result.token); updateToken(result.token) }
  const logout = () => { clearToken(); updateToken(null) }
  const editProduct = (product) => setProductForm({ id: product.id, name: product.name || '', slug: product.slug || '', categoryId: product.categoryId || '', tag: product.tag || '', image: product.image || '', gallery: product.gallery || [], summary: product.summary || '', specs: product.specs?.length ? product.specs : [''], isActive: product.isActive ?? true })
  const saveProduct = async (event) => { event.preventDefault(); const payload = { ...productForm, specs: productForm.specs.filter(Boolean) }; if (productForm.id) await api(`/admin/products/${productForm.id}`, { method: 'PUT', body: JSON.stringify(payload) }); else await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) }); setProductForm(emptyProduct); loadAdmin() }
  const deleteProduct = async (id) => { if (confirm('Xóa sản phẩm này?')) { await api(`/admin/products/${id}`, { method: 'DELETE' }); loadAdmin() } }
  const editCategory = (category) => setCategoryForm({ id: category.id, name: category.name || '', slug: category.slug || '', description: category.description || '', sortOrder: category.sortOrder || 0, isActive: category.isActive ?? true })
  const saveCategory = async (event) => { event.preventDefault(); if (categoryForm.id) await api(`/admin/categories/${categoryForm.id}`, { method: 'PUT', body: JSON.stringify(categoryForm) }); else await api('/admin/categories', { method: 'POST', body: JSON.stringify(categoryForm) }); setCategoryForm(emptyCategory); loadAdmin() }
  const deleteCategory = async (id) => { if (confirm('Xóa danh mục này?')) { await api(`/admin/categories/${id}`, { method: 'DELETE' }); loadAdmin() } }
  const editService = (service) => setServiceForm({ id: service.id, title: service.title || '', slug: service.slug || '', description: service.description || '', icon: service.icon || 'Settings', sortOrder: service.sortOrder || 0, isActive: service.isActive ?? true })
  const saveService = async (event) => { event.preventDefault(); if (serviceForm.id) await api(`/admin/services/${serviceForm.id}`, { method: 'PUT', body: JSON.stringify(serviceForm) }); else await api('/admin/services', { method: 'POST', body: JSON.stringify(serviceForm) }); setServiceForm(emptyService); loadAdmin() }
  const deleteService = async (id) => { if (confirm('Xóa dịch vụ này?')) { await api(`/admin/services/${id}`, { method: 'DELETE' }); loadAdmin() } }
  const updateLead = async (id, status, note) => { await api(`/admin/leads/${id}`, { method: 'PUT', body: JSON.stringify({ status, note }) }); loadAdmin() }
  const deleteLead = async (id) => { if (confirm('Xóa lead này?')) { await api(`/admin/leads/${id}`, { method: 'DELETE' }); setSelectedLead(null); loadAdmin() } }
  const saveSettings = async (event) => { event.preventDefault(); await api('/admin/site-settings', { method: 'PUT', body: JSON.stringify(settings) }); alert('Đã lưu cấu hình.') }

  if (!token) return <main className="admin-login"><form className="quote-form login-card" onSubmit={doLogin}><h1>Đăng nhập admin</h1><input placeholder="Email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /><input type="password" placeholder="Mật khẩu" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /><button className="primary-btn">Đăng nhập</button><a href="/">Về website</a></form></main>

  return <main className="admin-page"><aside className="admin-sidebar"><a className="brand" href="/"><Truck />Website</a><button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Sản phẩm</button><button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Danh mục</button><button className={tab === 'services' ? 'active' : ''} onClick={() => setTab('services')}>Dịch vụ</button><button className={tab === 'leads' ? 'active' : ''} onClick={() => setTab('leads')}>Lead</button><button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Cấu hình</button><button onClick={logout}><LogOut size={16} /> Đăng xuất</button></aside><section className="admin-content"><div className="section-heading"><span>Admin CMS</span><h2>Quản trị website xe nâng</h2></div>
    {tab === 'products' && <div className="admin-crud"><form className="quote-form" onSubmit={saveProduct}><h3><Plus /> {productForm.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3><input required placeholder="Tên sản phẩm" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /><input placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} /><select required value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}><option value="">Chọn danh mục</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="Tag" value={productForm.tag} onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })} /><label className="upload-box"><ImageUp /><strong>{uploading ? 'Đang nén & tải ảnh...' : 'Chọn ảnh sản phẩm'}</strong><span>Ảnh lớn sẽ tự resize và nén WebP</span><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} /></label>{productForm.image && <img className="image-preview" src={assetUrl(productForm.image)} alt="Ảnh sản phẩm" />}<label className="upload-box"><ImageUp /><strong>Thêm ảnh chi tiết sản phẩm</strong><span>Có thể chọn nhiều ảnh và upload một lần</span><input type="file" accept="image/*" multiple onChange={(e) => uploadGalleryImages(e.target.files)} /></label>{productForm.gallery?.length > 0 && <div className="gallery-editor">{productForm.gallery.map((image) => <div className="gallery-item" key={image}><img src={assetUrl(image)} alt="Ảnh chi tiết" /><button type="button" className="icon-btn" onClick={() => setProductForm({ ...productForm, gallery: productForm.gallery.filter((item) => item !== image) })}><Trash2 size={16} /></button></div>)}</div>}<textarea placeholder="Mô tả ngắn" value={productForm.summary} onChange={(e) => setProductForm({ ...productForm, summary: e.target.value })} /><div className="spec-editor"><strong>Thông số kỹ thuật</strong>{productForm.specs.map((spec, index) => <div className="spec-row" key={index}><input placeholder="VD: Tải trọng: 2.000 kg" value={spec} onChange={(e) => setSpec(index, e.target.value)} /><button type="button" className="icon-btn" onClick={() => removeSpec(index)}><Trash2 size={16} /></button></div>)}<button type="button" className="secondary-btn" onClick={addSpec}><Plus size={16} /> Thêm thông số</button></div><button className="primary-btn"><Save size={16} /> {productForm.id ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}</button>{productForm.id && <button type="button" className="secondary-btn" onClick={() => setProductForm(emptyProduct)}>Hủy sửa</button>}</form><div className="admin-panel"><h3><BarChart3 /> Danh sách sản phẩm</h3>{products.map((p) => <div className="lead-row" key={p.id}><div><strong>{p.name}</strong><small>{p.category?.name} - {p.slug}</small></div><div className="row-actions"><button className="icon-btn" onClick={() => editProduct(p)}><Edit3 size={16} /></button><button className="icon-btn" onClick={() => deleteProduct(p.id)}><Trash2 size={16} /></button></div></div>)}</div></div>}
    {tab === 'categories' && <div className="admin-crud"><form className="quote-form" onSubmit={saveCategory}><h3><Plus /> {categoryForm.id ? 'Sửa danh mục' : 'Thêm danh mục'}</h3><input required placeholder="Tên danh mục" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} /><input placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} /><textarea placeholder="Mô tả" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} /><button className="primary-btn"><Save size={16} /> {categoryForm.id ? 'Cập nhật danh mục' : 'Lưu danh mục'}</button>{categoryForm.id && <button type="button" className="secondary-btn" onClick={() => setCategoryForm(emptyCategory)}>Hủy sửa</button>}</form><div className="admin-panel"><h3>Danh mục</h3>{categories.map((c) => <div className="lead-row" key={c.id}><div><strong>{c.name}</strong><small>{c.slug}</small></div><div className="row-actions"><button className="icon-btn" onClick={() => editCategory(c)}><Edit3 size={16} /></button><button className="icon-btn" onClick={() => deleteCategory(c.id)}><Trash2 size={16} /></button></div></div>)}</div></div>}
    {tab === 'services' && <div className="admin-crud"><form className="quote-form" onSubmit={saveService}><h3><Settings /> {serviceForm.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h3><input required placeholder="Tên dịch vụ" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} /><input placeholder="Slug" value={serviceForm.slug} onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })} /><select value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}>{Object.keys(serviceIcons).map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select><input type="number" placeholder="Thứ tự" value={serviceForm.sortOrder} onChange={(e) => setServiceForm({ ...serviceForm, sortOrder: e.target.value })} /><textarea placeholder="Mô tả dịch vụ" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} /><button className="primary-btn"><Save size={16} /> {serviceForm.id ? 'Cập nhật dịch vụ' : 'Lưu dịch vụ'}</button>{serviceForm.id && <button type="button" className="secondary-btn" onClick={() => setServiceForm(emptyService)}>Hủy sửa</button>}</form><div className="admin-panel"><h3>Dịch vụ</h3>{services.map((s) => <div className="lead-row" key={s.id}><div><strong>{s.title}</strong><small>{s.slug}</small></div><div className="row-actions"><button className="icon-btn" onClick={() => editService(s)}><Edit3 size={16} /></button><button className="icon-btn" onClick={() => deleteService(s.id)}><Trash2 size={16} /></button></div></div>)}</div></div>}
    {tab === 'leads' && <div className="lead-admin"><div className="lead-overview"><div><span className="eyebrow">Quản lý lead</span><h3>Theo dõi yêu cầu tư vấn từ website</h3><p>Tìm kiếm, phân loại trạng thái và mở chi tiết để cập nhật ghi chú chăm sóc khách hàng.</p></div><div className="lead-stat"><strong>{filteredLeads.length}</strong><span>Lead đang hiển thị</span></div><div className="lead-stat"><strong>{leads.length}</strong><span>Tổng lead</span></div></div><div className="lead-toolbar"><label className="lead-search"><Search size={18} /><input placeholder="Tìm theo tên, SĐT, công ty hoặc nhu cầu..." value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} /></label><select value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)}><option value="ALL">Tất cả trạng thái</option>{Object.entries(leadStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="kanban-grid">{Object.entries(leadStatuses).map(([status, label]) => { const statusLeads = filteredLeads.filter((lead) => lead.status === status); return <div className={`kanban-column status-${status.toLowerCase()}`} key={status}><div className="kanban-column-head"><h3>{label}</h3><span>{statusLeads.length}</span></div>{statusLeads.length === 0 && <div className="kanban-empty">Chưa có lead</div>}{statusLeads.map((lead) => <button className="kanban-card" key={lead.id} onClick={() => setSelectedLead(lead)}><div className="kanban-card-head"><strong>{lead.name || 'Khách chưa nhập tên'}</strong><span>{leadStatuses[lead.status]}</span></div><p><Phone size={15} />{lead.phone}</p><p><Building2 size={15} />{lead.company || 'Chưa có công ty'}</p><small>{lead.need || 'Chưa ghi nhu cầu'}</small><time>{new Date(lead.createdAt).toLocaleDateString('vi-VN')}</time></button>)}</div> })}</div></div>}
    {tab === 'settings' && <form className="quote-form settings-form" onSubmit={saveSettings}>{[{ field: 'brand', label: 'Tên thương hiệu', icon: Building2, hint: 'Hiển thị ở header và footer' }, { field: 'hotline', label: 'Hotline', icon: Phone, hint: 'Dùng cho nút gọi nhanh' }, { field: 'zalo', label: 'Link Zalo', icon: MessageCircle, hint: 'Dùng cho CTA chat Zalo' }, { field: 'email', label: 'Email', icon: Mail, hint: 'Hiển thị ở khối liên hệ' }, { field: 'address', label: 'Địa chỉ', icon: MapPin, hint: 'Địa chỉ showroom/cửa hàng' }, { field: 'mapEmbed', label: 'Google Maps', icon: MapPinned, hint: 'Link nhúng bản đồ' }].map(({ field, label, icon: Icon, hint }) => <label className="setting-field" key={field}><span><Icon size={18} /><strong>{label}</strong></span><small>{hint}</small><input value={settings?.[field] || ''} onChange={(e) => setSettings({ ...settings, [field]: e.target.value })} /></label>)}<button className="primary-btn"><Save size={16} /> Lưu cấu hình</button></form>}
  </section>{selectedLead && <div className="modal-backdrop" onClick={() => setSelectedLead(null)}><div className="lead-modal" onClick={(e) => e.stopPropagation()}><button className="close-btn modal-close" onClick={() => setSelectedLead(null)}><X /></button><h2>{selectedLead.name}</h2><p><Phone size={16} /> {selectedLead.phone}</p><p><Building2 size={16} /> {selectedLead.company || 'Chưa có công ty'}</p><p>{selectedLead.need}</p><select value={selectedLead.status} onChange={(e) => setSelectedLead({ ...selectedLead, status: e.target.value })}>{Object.entries(leadStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><textarea placeholder="Ghi chú nội bộ" value={selectedLead.note || ''} onChange={(e) => setSelectedLead({ ...selectedLead, note: e.target.value })} /><div className="hero-actions"><button className="primary-btn" onClick={() => updateLead(selectedLead.id, selectedLead.status, selectedLead.note)}>Lưu lead</button><button className="secondary-btn" onClick={() => deleteLead(selectedLead.id)}>Xóa</button></div></div></div>}</main>
}

createRoot(document.getElementById('root')).render(window.location.pathname.startsWith('/admin') ? <AdminApp /> : <PublicSite />)





























