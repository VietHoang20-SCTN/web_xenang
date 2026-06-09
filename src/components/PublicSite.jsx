import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Building2, CheckCircle2, ClipboardList, Factory, Mail, MapPinned, MapPin, Menu, Moon, PackageCheck, Phone, Search, ShieldCheck, Sun, Users, X, Zap } from 'lucide-react'
import { api, assetUrl } from '../api'
import { categories as fallbackCategories, products as fallbackProducts, services as fallbackServices, siteSettings as fallbackSettings } from '../data'
import { leadStatuses, mapEmbedUrl, serviceIcons } from '../constants'
import { useTheme, useScrollAnimations, useScrollProgress, useParallax } from '../hooks'
import AlbumModal from './AlbumModal'

export default function PublicSite() {
  const { theme, toggleTheme } = useTheme()
  const scrollProgress = useScrollProgress()
  const [categories, setCategories] = useState(fallbackCategories)
  const [products, setProducts] = useState(fallbackProducts)
  const [serviceItems, setServiceItems] = useState(fallbackServices.map((service, index) => ({ ...service, id: service.title, icon: ['Truck', 'PackageCheck', 'Settings', 'Factory'][index] || 'Settings' })))
  const [siteSettings, setSiteSettings] = useState(fallbackSettings)
  const [activeCategory, setActiveCategory] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
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

  // Track active section for nav highlighting
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id)
      })
    }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useScrollAnimations([products, categories, serviceItems, activeCategory, searchQuery])
  useParallax()
  const productsSectionRef = useRef(null)

  useEffect(() => {
    if (searchQuery.trim() && productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchQuery])

  const filteredProducts = useMemo(() => {
    let result = activeCategory === 'all' ? products : products.filter((product) => product.category?.slug === activeCategory || product.category?.id === activeCategory || product.categoryId === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((product) => product.name?.toLowerCase().includes(q) || product.summary?.toLowerCase().includes(q) || product.tag?.toLowerCase().includes(q) || (product.specs || []).some((spec) => spec.toLowerCase().includes(q)))
    }
    return result
  }, [activeCategory, products, searchQuery])
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
  const submitLead = async (event) => {
    event.preventDefault()
    const phone = leadForm.phone.replace(/\s/g, '')
    if (!leadForm.name.trim() || !leadForm.need.trim()) { alert('Vui lòng nhập họ tên và nhu cầu tư vấn.'); return }
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone)) { alert('Vui lòng nhập số điện thoại Việt Nam hợp lệ, đủ 10 chữ số.'); return }
    try {
      await api('/public/leads', { method: 'POST', body: JSON.stringify({ ...leadForm, phone }) })
      alert('Cảm ơn bạn. Thông tin đã được ghi nhận, đội ngũ tư vấn sẽ liên hệ lại sớm.')
      setLeadForm({ name: '', phone: '', company: '', need: '', productId: '' })
    } catch (error) { alert(error.message) }
  }

  return <>
    {/* Background bokeh orbs */}
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => <span key={i} className={`orb orb-${i + 1}`} />)}
    </div>

    {/* Scroll progress bar */}
    <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

    <header className="site-header">
      <a className="brand" href="#home">{(theme === 'dark' ? (siteSettings.logoDark || siteSettings.logo) : (siteSettings.logo || siteSettings.logoDark)) ? <img className="brand-logo" src={assetUrl(theme === 'dark' ? (siteSettings.logoDark || siteSettings.logo) : (siteSettings.logo || siteSettings.logoDark))} alt={siteSettings.brand} /> : <Zap size={28} />}</a>
      <nav className="desktop-nav"><a href="#products" className={activeSection === 'products' ? 'active' : ''}>Sản phẩm</a><a href="#services" className={activeSection === 'services' ? 'active' : ''}>Dịch vụ</a><a href="#about" className={activeSection === 'about' ? 'active' : ''}>Giới thiệu</a><a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>Liên hệ</a></nav>
      <div className="header-actions">
        <div className={`header-search ${searchOpen ? 'open' : ''}`}>
          <button className="search-toggle" onClick={() => setSearchOpen(!searchOpen)} aria-label="Tìm kiếm"><Search size={20} /></button>
          {searchOpen && <input className="search-input" type="text" placeholder="Tìm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />}
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Chuyển đổi chế độ sáng/tối">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <a className="phone-link" href={`tel:${siteSettings.hotline}`}><Phone size={18} />{siteSettings.hotline}</a>
        <button className="menu-btn" onClick={() => setMobileMenuOpen(true)}><Menu /></button>
      </div>
    </header>

    {mobileMenuOpen && <div className="mobile-panel">
      <button className="close-btn" onClick={() => setMobileMenuOpen(false)}><X /></button>
      <a onClick={() => setMobileMenuOpen(false)} href="#products">Sản phẩm</a>
      <a onClick={() => setMobileMenuOpen(false)} href="#services">Dịch vụ</a>
      <a onClick={() => setMobileMenuOpen(false)} href="#contact">Liên hệ</a>
    </div>}

    <main className="snap-main">
      {/* Hero */}
      <section id="home" className="hero page-enter">
        <div className="hero-copy">
          <span className="eyebrow"><Zap size={16} /> Bán & cho thuê xe nâng tại miền Bắc</span>
          <h1 className="parallax-slow">Giải pháp xe nâng điện và thiết bị kho cho doanh nghiệp logistics.</h1>
          <p className="parallax-medium">Website B2B tối giản, rõ thông số, CTA nổi bật để khách hàng dễ gọi điện, gửi báo giá hoặc chat Zalo.</p>
          <div className="hero-actions">
            <a className="primary-btn quote-pulse" href="#quote">Nhận báo giá <ArrowRight size={18} /></a>
            <a className="zalo-icon-btn" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a>
          </div>
        </div>
        <div className="hero-card parallax-slow">
          <div className="hero-carousel"><div className="hero-carousel-track">{[...heroImages, ...heroImages].map((image, index) => <img key={`${image}-${index}`} src={assetUrl(image)} alt="Hình ảnh sản phẩm xe nâng" />)}</div></div>
          <div className="metric"><strong>{categories.length}+</strong><span>Nhóm sản phẩm chủ lực</span></div>
          <div className="metric"><strong>24h</strong><span>Tiếp nhận yêu cầu tư vấn</span></div>
          <div className="metric"><strong>Miền Bắc</strong><span>Tập trung Bắc Ninh và khu vực lân cận</span></div>
        </div>
        <div className="hero-trust">
          <div className="reveal-rotate stagger-1"><Factory /><strong>Logistics & fulfillment</strong><span>Phù hợp kho vận, trung tâm phân phối.</span></div>
          <div className="reveal-rotate stagger-2"><ShieldCheck /><strong>Uy tín dịch vụ</strong><span>Có bán, cho thuê, phụ tùng và sửa chữa.</span></div>
          <div className="reveal-rotate stagger-3"><PackageCheck /><strong>Thiết bị kho</strong><span>Tập trung xe nâng điện và warehouse equipment.</span></div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="section reveal-clip" ref={productsSectionRef}>
        <div className="section-heading reveal-blur"><span>Sản phẩm</span><h2>{searchQuery.trim() ? `Kết quả tìm kiếm "${searchQuery}"` : 'Danh mục xe nâng trọng tâm'}</h2><p>{searchQuery.trim() ? `Tìm thấy ${filteredProducts.length} sản phẩm` : 'Xem nhanh thông số kỹ thuật và gửi yêu cầu tư vấn thuê/mua.'}</p></div>
        <div className="category-tabs">
          <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>Tất cả</button>
          {categories.map((category) => <button className={activeCategory === (category.slug || category.id) ? 'active' : ''} key={category.id || category.slug} onClick={() => setActiveCategory(category.slug || category.id)}>{category.name}</button>)}
        </div>
        <div className="product-grid">
          {filteredProducts.map((product, index) => <article className={`product-card reveal-scale stagger-${index % 8 + 1}`} key={product.id}>
            <button className="product-image-button" onClick={() => openAlbum(product, 0)}><img src={assetUrl(product.image)} alt={product.name} /><span>Xem album</span></button>
            <div className="product-body">
              <span className="tag">{product.tag}</span>
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <div className="product-gallery-slot">
                {product.gallery?.length > 0
                  ? <div className="product-thumbs">{product.gallery.slice(0, 4).map((image, index) => <button key={image} onClick={() => openAlbum(product, index + 1)}><img src={assetUrl(image)} alt={`${product.name} chi tiết`} /></button>)}</div>
                  : <div className="no-gallery">Hiện tại không có ảnh chi tiết sản phẩm</div>}
              </div>
              <ul>{(product.specs || []).slice(0, 4).map((spec) => <li key={spec}><CheckCircle2 size={16} />{spec}</li>)}</ul>
              {(product.specs || []).length > 4 && <button className="more-link" onClick={() => openProductDetail(product)}>Xem thêm {(product.specs || []).length - 4} thông số</button>}
              <div className="card-actions">
                <a href="#quote" onClick={() => setLeadForm({ ...leadForm, productId: product.id, need: `Tư vấn ${product.name}` })}>Nhận báo giá</a>
                <a className="zalo-icon-btn small-zalo" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a>
              </div>
            </div>
          </article>)}
        </div>
        {filteredProducts.length === 0 && <div className="empty-state">Chưa có sản phẩm trong danh mục này.</div>}
      </section>

      {/* Services */}
      <section id="services" className="section alt-section reveal-clip">
        <div className="section-heading reveal-blur"><span>Dịch vụ</span><h2>Bán, cho thuê, sửa chữa và phụ tùng</h2></div>
        <div className="service-grid">
          {serviceItems.map((service, index) => { const Icon = serviceIcons[service.icon] || Settings; return <div className={`service-card reveal-left stagger-${index % 8 + 1}`} key={service.id || service.title}><Icon /><h3>{service.title}</h3><p>{service.description}</p></div> })}
        </div>
      </section>

      {/* About & Lead Form */}
      <section id="about" className="about-quote-section reveal-clip">
        <div className="about-copy reveal-left">
          <span className="eyebrow">Định vị thương hiệu</span>
          <h2>Website B2B cho doanh nghiệp có hoạt động kho tại miền Bắc.</h2>
          <p>Thông tin sản phẩm rõ ràng, CTA ngắn gọn, phù hợp khách hàng logistics, fulfillment, kho lạnh và nhà máy.</p>
          <div className="audience-card"><h3>Khách hàng mục tiêu</h3><ul><li>Doanh nghiệp logistics và fulfillment</li><li>Kho lạnh, kho hàng hóa, trung tâm phân phối</li><li>Nhà máy sản xuất có nhu cầu nâng hạ</li></ul></div>
        </div>
        <div id="quote" className="lead-card reveal-right">
          <span className="eyebrow"><ClipboardList size={16} /> Form lead</span>
          <h2>Yêu cầu tư vấn thuê/mua xe nâng</h2>
          <p>Form ngắn, tối ưu mobile, lưu trực tiếp vào hệ thống quản trị.</p>
          <form className="quote-form lead-form" onSubmit={submitLead}>
            <label className="input-icon"><Users size={18} /><input required placeholder="Họ tên *" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} /></label>
            <label className="input-icon"><Phone size={18} /><input required inputMode="tel" placeholder="Số điện thoại *" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} /></label>
            <label className="input-icon"><Building2 size={18} /><input placeholder="Công ty (không bắt buộc)" value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} /></label>
            <label className="input-icon textarea-icon"><ClipboardList size={18} /><textarea required placeholder="Nhu cầu *: thuê xe, mua xe, sửa chữa, phụ tùng..." value={leadForm.need} onChange={(e) => setLeadForm({ ...leadForm, need: e.target.value })} /></label>
            <button className="primary-btn" type="submit">Gửi yêu cầu</button>
          </form>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section contact-section reveal-clip">
        <div className="map-card reveal-left">
          {mapEmbedUrl(siteSettings.mapEmbed, siteSettings.address)
            ? <iframe title="Bản đồ" src={mapEmbedUrl(siteSettings.mapEmbed, siteSettings.address)} loading="lazy"></iframe>
            : <div className="map-fallback"><MapPinned size={34} /><strong>Không thể nhúng trực tiếp link Google Maps này</strong><span>Link rút gọn từ admin vẫn được dùng để mở bản đồ bên ngoài.</span></div>}
        </div>
        <div className="contact-info reveal-right">
          <span>Liên hệ</span>
          <h2>{siteSettings.brand}</h2>
          <p><MapPin size={18} /> {siteSettings.address}</p>
          <p><Phone size={18} /> {siteSettings.hotline}</p>
          <p><Mail size={18} /> {siteSettings.email}</p>
        </div>
      </section>
    </main>

    {/* Album Modal */}
    {album && <AlbumModal album={album} albumIndex={albumIndex} setAlbumIndex={setAlbumIndex} selectedProduct={selectedProduct} onClose={() => { setAlbum(null); setSelectedProduct(null) }} siteSettings={siteSettings} onQuote={(productId, need) => { setLeadForm({ ...leadForm, productId, need }); setAlbum(null); setSelectedProduct(null) }} />}

    <div className="floating-actions">
      <a href={`tel:${siteSettings.hotline}`}><Phone size={20} /> Gọi</a>
      <a className="zalo-icon-btn small-zalo" href={siteSettings.zalo} aria-label="Chat Zalo"><span>Zalo</span></a>
    </div>
    <footer>© 2026 {siteSettings.brand}. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.</footer>
  </>
}