import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Factory,
  FileText,
  Mail,
  MapPinned,
  MapPin,
  Menu,
  Moon,
  PackageCheck,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Truck,
  Users,
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { api, assetUrl } from '../api'

import { mapEmbedUrl, serviceIcons } from '../constants'
import { useTheme, useScrollAnimations, useScrollProgress } from '../hooks'
import AlbumModal from './AlbumModal'
import { notify } from '../toast'
import { setPageMeta } from '../seo'

export default function PublicSite() {
  const { theme, toggleTheme } = useTheme()
  const scrollProgress = useScrollProgress()
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [serviceItems, setServiceItems] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [siteSettings, setSiteSettings] = useState({})
  const [activeCategory, setActiveCategory] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const wasMobileMenuOpen = useRef(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', company: '', need: '', productId: '' })
  const [album, setAlbum] = useState(null)
  const [albumIndex, setAlbumIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [aboutCarouselIndex, setAboutCarouselIndex] = useState(0)
  const [lightbox, setLightbox] = useState(null) // { images, index }

  useEffect(() => {
    setPageMeta()
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) {
      if (wasMobileMenuOpen.current) menuButtonRef.current?.focus()
      wasMobileMenuOpen.current = false
      return
    }

    wasMobileMenuOpen.current = true
    const dialog = closeButtonRef.current?.parentElement
    const siblings = [...(dialog?.parentElement?.children || [])].filter((element) => element !== dialog)
    const inertStates = siblings.map((element) => [element, element.inert])
    siblings.forEach((element) => {
      element.inert = true
    })
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])')]
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

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      inertStates.forEach(([element, inert]) => {
        element.inert = inert
      })
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    Promise.allSettled([
      api('/public/categories'),
      api('/public/products'),
      api('/public/services'),
      api('/public/site-settings'),
      api('/public/blog?limit=7'),
    ]).then(([categoriesResult, productsResult, servicesResult, settingsResult, blogResult]) => {
      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value || [])
      if (productsResult.status === 'fulfilled') setProducts(productsResult.value || [])
      if (servicesResult.status === 'fulfilled') setServiceItems(servicesResult.value || [])
      if (settingsResult.status === 'fulfilled') setSiteSettings(settingsResult.value || {})
      if (blogResult.status === 'fulfilled') setBlogPosts(blogResult.value?.items || [])
    })
  }, [])

  useEffect(() => {
    const sectionId = location.hash.slice(1) || location.state?.scrollTo
    if (!sectionId) return

    setActiveSection(sectionId)
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior, block: 'start' })
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [location.hash, location.key, location.state, categories, products, serviceItems, blogPosts])

  useEffect(() => {
    const sections = [...document.querySelectorAll('section[id]')]
    const updateActiveSection = () => {
      const activationLine = window.innerHeight * 0.3
      const current = sections.reduce(
        (active, section) => (section.getBoundingClientRect().top <= activationLine ? section : active),
        sections[0]
      )
      setActiveSection(current.id)
    }
    const scrollRoot = document.querySelector('.snap-main')
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection, { passive: true })
    scrollRoot.addEventListener('scroll', updateActiveSection, { passive: true })
    updateActiveSection()
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
      scrollRoot.removeEventListener('scroll', updateActiveSection)
    }
  }, [blogPosts])

  useScrollAnimations([products, categories, serviceItems, blogPosts, activeCategory, searchQuery])

  // Auto-advance about image carousel every 7 seconds
  useEffect(() => {
    const images = siteSettings?.aboutImages
    if (!images?.length || images.length < 2) return
    const timer = setInterval(() => {
      setAboutCarouselIndex((prev) => (prev + 1) % images.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [siteSettings?.aboutImages])
  const productsSectionRef = useRef(null)

  useEffect(() => {
    if (searchQuery.trim() && productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchQuery])

  const filteredProducts = useMemo(() => {
    let result =
      activeCategory === 'all'
        ? products
        : products.filter(
            (product) =>
              product.category?.slug === activeCategory ||
              product.category?.id === activeCategory ||
              product.categoryId === activeCategory
          )
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(q) ||
          product.summary?.toLowerCase().includes(q) ||
          product.tag?.toLowerCase().includes(q) ||
          (product.specs || []).some((spec) => spec.toLowerCase().includes(q))
      )
    }
    return result
  }, [activeCategory, products, searchQuery])
  const heroImages = useMemo(
    () =>
      products
        .map((product) => product.image)
        .filter(Boolean)
        .slice(0, 10),
    [products]
  )

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
    if (!leadForm.name.trim() || !leadForm.need.trim()) {
      notify.error('Vui lòng nhập họ tên và nhu cầu tư vấn.')
      return
    }
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone)) {
      notify.error('Vui lòng nhập số điện thoại Việt Nam hợp lệ, đủ 10 chữ số.')
      return
    }
    const loadingId = notify.loading('Đang gửi yêu cầu...')
    try {
      await api('/public/leads', { method: 'POST', body: JSON.stringify({ ...leadForm, phone }) })
      notify.dismiss(loadingId)
      notify.success('Cảm ơn bạn! Thông tin đã được ghi nhận, đội ngũ tư vấn sẽ liên hệ lại sớm.')
      setLeadForm({ name: '', phone: '', company: '', need: '', productId: '' })
    } catch (error) {
      notify.dismiss(loadingId)
      notify.error(error.message)
    }
  }

  return (
    <>
      {/* Background bokeh orbs */}
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`orb orb-${i + 1}`} />
        ))}
      </div>

      {/* Scroll progress bar */}
      <div ref={scrollProgress} className="scroll-progress" />

      <header className={`site-header ${searchOpen ? 'search-active' : ''}`}>
        <a className="brand" href="#home">
          {(
            theme === 'dark' ? siteSettings.logoDark || siteSettings.logo : siteSettings.logo || siteSettings.logoDark
          ) ? (
            <img
              className="brand-logo"
              src={assetUrl(
                theme === 'dark'
                  ? siteSettings.logoDark || siteSettings.logo
                  : siteSettings.logo || siteSettings.logoDark
              )}
              alt={siteSettings.brand}
            />
          ) : (
            <Zap size={28} />
          )}
        </a>
        <nav className="desktop-nav">
          <Link to="/#home" className={activeSection === 'home' ? 'active' : ''}>
            Trang chủ
          </Link>
          <Link to="/#about" className={activeSection === 'about' ? 'active' : ''}>
            Giới thiệu
          </Link>
          <Link to="/#products" className={activeSection === 'products' ? 'active' : ''}>
            Sản phẩm
          </Link>
          <Link to="/#services" className={activeSection === 'services' ? 'active' : ''}>
            Dịch vụ
          </Link>
          <Link to="/#contact" className={activeSection === 'contact' ? 'active' : ''}>
            Liên hệ
          </Link>
          <Link
            to="/blog"
            className={activeSection === 'blog' ? 'active' : ''}
            aria-current={activeSection === 'blog' ? 'location' : undefined}
          >
            Blog
          </Link>
        </nav>
        <div className="header-actions">
          <div className={`header-search ${searchOpen ? 'open' : ''}`}>
            <button
              className="search-toggle"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? 'Đóng tìm kiếm' : 'Tìm kiếm'}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            {searchOpen && (
              <input
                className="search-input"
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            )}
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Chuyển đổi chế độ sáng/tối">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a className="phone-link" href={`tel:${siteSettings.hotline}`}>
            <Phone size={18} />
            {siteSettings.hotline}
          </a>
          <button
            ref={menuButtonRef}
            className="menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Mở menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="home-mobile-menu"
          >
            <Menu />
          </button>
        </div>
      </header>
      {mobileMenuOpen && (
        <div
          id="home-mobile-menu"
          className="mobile-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Điều hướng chính"
        >
          <button
            ref={closeButtonRef}
            className="close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
          >
            <X />
          </button>
          <Link
            to="/#home"
            className={activeSection === 'home' ? 'active' : ''}
            aria-current={activeSection === 'home' ? 'location' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Trang chủ
          </Link>
          <Link
            to="/#about"
            className={activeSection === 'about' ? 'active' : ''}
            aria-current={activeSection === 'about' ? 'location' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Giới thiệu
          </Link>
          <Link
            to="/#products"
            className={activeSection === 'products' ? 'active' : ''}
            aria-current={activeSection === 'products' ? 'location' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Sản phẩm
          </Link>
          <Link
            to="/#services"
            className={activeSection === 'services' ? 'active' : ''}
            aria-current={activeSection === 'services' ? 'location' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dịch vụ
          </Link>
          <Link
            to="/#contact"
            className={activeSection === 'contact' ? 'active' : ''}
            aria-current={activeSection === 'contact' ? 'location' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Liên hệ
          </Link>
          <Link
            to="/blog"
            className={activeSection === 'blog' ? 'active' : ''}
            aria-current={activeSection === 'blog' ? 'location' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
        </div>
      )}

      <main className="snap-main">
        {/* Hero */}
        <section id="home" className="hero page-enter">
          <div className="hero-copy">
            <span className="eyebrow">
              <Zap size={16} /> Bán & cho thuê xe nâng tại miền Bắc
            </span>
            <h1 className="parallax-slow">
              {siteSettings.heroTitle || 'Giải pháp xe nâng điện và thiết bị kho cho doanh nghiệp logistics.'}
            </h1>
            <p className="parallax-medium">
              {siteSettings.heroSubtitle ||
                'Bán & cho thuê xe nâng, phụ tùng, sửa chữa tại Bắc Ninh. Hotline tư vấn 24h.'}
            </p>
            <div className="hero-actions">
              <a className="primary-btn quote-pulse" href="#quote">
                Nhận báo giá <ArrowRight size={18} />
              </a>
              <a className="zalo-icon-btn" href={siteSettings.zalo} aria-label="Chat Zalo">
                <span>Zalo</span>
              </a>
            </div>
          </div>
          <div className="hero-card parallax-slow">
            <div className="hero-carousel">
              <div className="hero-carousel-track">
                {[...heroImages, ...heroImages].map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={assetUrl(image)}
                    alt="Hình ảnh sản phẩm xe nâng"
                    loading={index < 2 ? 'eager' : 'lazy'}
                    width={400}
                    height={300}
                  />
                ))}
              </div>
            </div>
            {(siteSettings.heroMetrics?.length
              ? siteSettings.heroMetrics.filter((m) => m.number || m.label)
              : [
                  { number: categories.length + '+', label: 'Nhóm sản phẩm chủ lực' },
                  { number: '24h', label: 'Tiếp nhận yêu cầu tư vấn' },
                  { number: 'Miền Bắc', label: 'Tập trung Bắc Ninh và khu vực lân cận' },
                ]
            ).map((m, i) => (
              <div className="metric" key={i}>
                <strong>{m.number}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-trust">
            {(siteSettings.trustBadges?.length
              ? siteSettings.trustBadges
              : [
                  { icon: 'Factory', title: 'Logistics & fulfillment', desc: 'Phù hợp kho vận, trung tâm phân phối.' },
                  { icon: 'ShieldCheck', title: 'Uy tín dịch vụ', desc: 'Có bán, cho thuê, phụ tùng và sửa chữa.' },
                  {
                    icon: 'PackageCheck',
                    title: 'Thiết bị kho',
                    desc: 'Tập trung xe nâng điện và warehouse equipment.',
                  },
                ]
            ).map((b, i) => {
              const Icon =
                { Factory, ShieldCheck, PackageCheck, Truck, Zap, Settings, Users, Building2 }[b.icon] ||
                (b.icon === 'Tool' ? Settings : ShieldCheck)
              return (
                <div className={`reveal-rotate stagger-${i + 1}`} key={i}>
                  <Icon />
                  <strong>{b.title}</strong>
                  <span>{b.desc}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* About & Lead Form */}
        <section id="about" className="about-quote-section reveal-clip">
          <div className="about-copy reveal-left">
            <span className="eyebrow">Định vị thương hiệu</span>
            <h2>{siteSettings.aboutTitle || 'Website B2B cho doanh nghiệp có hoạt động kho tại miền Bắc.'}</h2>
            {siteSettings.aboutBody ? (
              <div className="about-body" dangerouslySetInnerHTML={{ __html: siteSettings.aboutBody }} />
            ) : (
              <p>
                Thông tin sản phẩm rõ ràng, CTA ngắn gọn, phù hợp khách hàng logistics, fulfillment, kho lạnh và nhà
                máy.
              </p>
            )}
            {(() => {
              const audience = siteSettings.aboutAudience
              const title = audience?.title?.trim()
              const intro = audience?.intro?.trim()
              const bullets = (audience?.bullets || []).filter((b) => b && b.trim())
              if (!title && !intro && bullets.length === 0) {
                return (
                  <div className="audience-card">
                    <h3>Khách hàng mục tiêu</h3>
                    <ul>
                      <li>Doanh nghiệp logistics và fulfillment</li>
                      <li>Kho lạnh, kho hàng hóa, trung tâm phân phối</li>
                      <li>Nhà máy sản xuất có nhu cầu nâng hạ</li>
                    </ul>
                  </div>
                )
              }
              return (
                <div className="audience-card">
                  {title ? <h3>{title}</h3> : null}
                  {intro ? <p>{intro}</p> : null}
                  {bullets.length > 0 ? (
                    <ul>
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )
            })()}
            {siteSettings.aboutImages?.length > 0 ? (
              <div className="about-coverflow">
                <div className="about-coverflow-stage">
                  {siteSettings.aboutImages.map((img, i) => {
                    const n = siteSettings.aboutImages.length
                    const raw = i - aboutCarouselIndex
                    const offset = raw > n / 2 ? raw - n : raw < -n / 2 ? raw + n : raw
                    const isCenter = offset === 0
                    const isVisible = Math.abs(offset) <= 2
                    if (!isVisible) return null
                    return (
                      <button
                        type="button"
                        key={i}
                        className={`about-coverflow-item${isCenter ? ' active' : ''}`}
                        aria-label={isCenter ? `Mở ảnh giới thiệu ${i + 1}` : `Chọn ảnh giới thiệu ${i + 1}`}
                        style={{
                          transform: `perspective(1000px) translateX(${offset * 150}px) translateZ(${isCenter ? 60 : -20}px) rotateY(${offset * -8}deg) scale(${isCenter ? 1 : 0.85})`,
                          zIndex: 10 - Math.abs(offset),
                          opacity: Math.max(0.25, 1 - Math.abs(offset) * 0.38),
                        }}
                        onClick={() => {
                          if (isCenter) setLightbox({ images: siteSettings.aboutImages, index: i })
                          else setAboutCarouselIndex(i)
                        }}
                      >
                        <img src={assetUrl(img)} alt="" />
                      </button>
                    )
                  })}
                </div>
                {siteSettings.aboutImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="about-coverflow-btn about-coverflow-prev"
                      aria-label="Ảnh giới thiệu trước"
                      onClick={() =>
                        setAboutCarouselIndex((i) => (i === 0 ? siteSettings.aboutImages.length - 1 : i - 1))
                      }
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className="about-coverflow-btn about-coverflow-next"
                      aria-label="Ảnh giới thiệu tiếp theo"
                      onClick={() =>
                        setAboutCarouselIndex((i) => (i === siteSettings.aboutImages.length - 1 ? 0 : i + 1))
                      }
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="about-coverflow-counter" aria-live="polite">
                      {aboutCarouselIndex + 1} / {siteSettings.aboutImages.length}
                    </div>
                  </>
                )}
              </div>
            ) : siteSettings.aboutImage ? (
              <div className="about-image-wrap">
                <img src={assetUrl(siteSettings.aboutImage)} alt="Giới thiệu" className="about-image" />
              </div>
            ) : null}
          </div>
          <div id="quote" className="lead-card reveal-right">
            <span className="eyebrow">
              <ClipboardList size={16} /> Form lead
            </span>
            <h2>Yêu cầu tư vấn thuê/mua xe nâng</h2>
            <p>Khách hàng vui lòng điền đầy đủ thông tin</p>
            <form className="quote-form lead-form" onSubmit={submitLead}>
              <label className="input-icon">
                <Users size={18} />
                <input
                  required
                  placeholder="Họ tên *"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                />
              </label>
              <label className="input-icon">
                <Phone size={18} />
                <input
                  required
                  inputMode="tel"
                  placeholder="Số điện thoại *"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                />
              </label>
              <label className="input-icon">
                <Building2 size={18} />
                <input
                  placeholder="Công ty (không bắt buộc)"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                />
              </label>
              <label className="input-icon textarea-icon">
                <ClipboardList size={18} />
                <textarea
                  required
                  placeholder="Nhu cầu *: thuê xe, mua xe, sửa chữa, phụ tùng..."
                  value={leadForm.need}
                  onChange={(e) => setLeadForm({ ...leadForm, need: e.target.value })}
                />
              </label>
              <button className="primary-btn" type="submit">
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="section reveal-clip" ref={productsSectionRef}>
          <div className="section-heading reveal-blur">
            <span>Sản phẩm</span>
            <h2>{searchQuery.trim() ? `Kết quả tìm kiếm "${searchQuery}"` : 'Danh mục xe nâng trọng tâm'}</h2>
            <p>
              {searchQuery.trim()
                ? `Tìm thấy ${filteredProducts.length} sản phẩm`
                : 'Xem nhanh thông số kỹ thuật và gửi yêu cầu tư vấn thuê/mua.'}
            </p>
          </div>
          <div className="category-tabs">
            <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                className={activeCategory === (category.slug || category.id) ? 'active' : ''}
                key={category.id || category.slug}
                onClick={() => setActiveCategory(category.slug || category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <article className={`product-card reveal-scale stagger-${(index % 8) + 1}`} key={product.id}>
                <div className="product-image-wrapper" onClick={() => openAlbum(product, 0)}>
                  <img src={assetUrl(product.image)} alt={product.name} loading="lazy" width={600} height={375} />
                  <span className="image-hint">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    Xem ảnh
                  </span>
                  <div className="product-badge">
                    <span className="tag">{product.tag}</span>
                  </div>
                </div>

                {/* Gallery Thumbnail Strip or No-Gallery Placeholder */}
                {(product.gallery || []).length > 0 ? (
                  <div className="product-gallery-strip">
                    {(product.gallery || []).map((img, i) => (
                      <button
                        key={img}
                        className="product-gallery-thumb"
                        onClick={(e) => {
                          e.stopPropagation()
                          openAlbum(product, i)
                        }}
                        aria-label={`Xem ảnh ${i + 1} của ${product.name}`}
                      >
                        <img src={assetUrl(img)} alt={`${product.name} - ảnh ${i + 1}`} loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="product-no-gallery">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    Hiện sản phẩm không có ảnh hiển thị
                  </div>
                )}

                <div className="product-body">
                  <Link to={`/san-pham/${product.slug || product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p className="product-desc">{product.summary}</p>

                  <div className="spec-chips">
                    {(product.specs || []).slice(0, 4).map((spec) => (
                      <span className="spec-chip" key={spec}>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {spec}
                      </span>
                    ))}
                    {(product.specs || []).length > 4 && (
                      <button className="more-specs-link" onClick={() => openProductDetail(product)}>
                        +{(product.specs || []).length - 4}
                      </button>
                    )}
                  </div>

                  <div className="product-actions">
                    <Link to={`/san-pham/${product.slug || product.id}`} className="detail-link">
                      Xem chi tiết
                    </Link>
                    <button
                      className="quote-btn"
                      onClick={() => {
                        setLeadForm({ ...leadForm, productId: product.id, need: `Tư vấn ${product.name}` })
                        document.getElementById('quote').scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Nhận báo giá
                    </button>
                    <a className="zalo-btn" href={siteSettings.zalo} target="_blank" rel="noopener noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                      Chat Zalo
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && <div className="empty-state">Chưa có sản phẩm trong danh mục này.</div>}
        </section>

        {/* Services */}
        <section id="services" className="section alt-section journey-section journey-services reveal-clip">
          <div className="section-heading reveal-blur">
            <span>Dịch vụ</span>
            <h2>Bán, cho thuê, sửa chữa và phụ tùng</h2>
            <p>Giải pháp trọn vòng đời thiết bị, từ lựa chọn xe đến bảo trì vận hành.</p>
          </div>
          <div className="service-catalog">
            {serviceItems.map((service, index) => {
              const Icon = serviceIcons[service.icon] || Settings
              const serviceSlug =
                service.slug ||
                service.title
                  ?.toLowerCase()
                  .replace(/\s+/g, '-')
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
              return (
                <Link
                  to={`/dich-vu/${serviceSlug}`}
                  className={`service-catalog-card reveal-left stagger-${(index % 8) + 1}`}
                  key={service.id || service.title}
                >
                  <div className="service-catalog-media">
                    {service.image ? <img src={assetUrl(service.image)} alt={service.title} loading="lazy" /> : <Icon aria-hidden="true" />}
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="service-catalog-copy">
                    <i><Icon aria-hidden="true" /></i>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <strong>Xem chi tiết <ChevronRight size={16} /></strong>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="section contact-section journey-section journey-contact reveal-clip">
          {/* Map */}
          <div className="contact-map-wrap reveal-scale">
            <div className="contact-map-label"><span>Vị trí hoạt động</span><strong>Bắc Ninh · Miền Bắc</strong></div>
            {mapEmbedUrl(siteSettings.mapEmbed, siteSettings.address) ? (
              <iframe
                title="Bản đồ"
                src={mapEmbedUrl(siteSettings.mapEmbed, siteSettings.address)}
                loading="lazy"
              ></iframe>
            ) : (
              <div className="contact-map-fallback">
                <MapPinned size={36} />
                <strong>Không thể nhúng bản đồ</strong>
                <span>Link rút gọn từ admin vẫn được dùng để mở bản đồ bên ngoài.</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="contact-body">
            <div className="contact-heading reveal-blur">
              <div className="contact-heading-meta"><span className="contact-eyebrow">Trạm liên hệ</span><span className="contact-section-index">05 / 06</span></div>
              <h2>{siteSettings.brand || 'Thông tin liên hệ'}</h2>
              <p className="contact-intro">Kết nối trực tiếp với đội ngũ tư vấn để nhận phương án thiết bị phù hợp cho vận hành của bạn.</p>
            </div>

            <div className="contact-cards-row">
              <div className="contact-info-card reveal-scale stagger-1">
                <div className="contact-info-icon">
                  <MapPin size={22} />
                </div>
                <h4>Địa chỉ</h4>
                <p>{siteSettings.address || 'Đang cập nhật'}</p>
              </div>
              <div className="contact-info-card reveal-scale stagger-2">
                <div className="contact-info-icon">
                  <Phone size={22} />
                </div>
                <h4>Hotline</h4>
                <a href={`tel:${siteSettings.hotline}`}>{siteSettings.hotline || '0900 000 000'}</a>
              </div>
              <div className="contact-info-card reveal-scale stagger-3">
                <div className="contact-info-icon">
                  <Mail size={22} />
                </div>
                <h4>Email</h4>
                <a href={`mailto:${siteSettings.email}`}>{siteSettings.email || 'contact@xenang.vn'}</a>
              </div>
            </div>

            {siteSettings.hotline && <a className="contact-direct-call" href={`tel:${siteSettings.hotline}`}>
              <span>Trao đổi trực tiếp</span>
              <strong>{siteSettings.hotline}</strong>
              <ArrowRight size={20} />
            </a>}
          </div>
        </section>

        {/* Blog */}
        {blogPosts.length > 0 && (
          <section id="blog" className="section reveal-clip">
            <div className="section-heading reveal-blur">
              <span>Blog</span>
              <h2>Kiến thức & Tin tức</h2>
              <p>Cập nhật kiến thức về xe nâng, thiết bị kho và giải pháp logistics.</p>
            </div>
            <div className="homepage-blog">
              {/* Featured first post */}
              <article className="blog-featured reveal-scale stagger-1">
                <Link to={`/blog/${blogPosts[0].slug}`} className="blog-featured-image">
                  {blogPosts[0].coverImage ? (
                    <img src={assetUrl(blogPosts[0].coverImage)} alt={blogPosts[0].title} loading="eager" />
                  ) : (
                    <div className="blog-featured-fallback">
                      <FileText size={40} />
                    </div>
                  )}
                  <div className="blog-featured-overlay" />
                  <span className="blog-featured-badge">Mới nhất</span>
                </Link>
                <div className="blog-featured-body">
                  <div className="blog-featured-meta">
                    <span>
                      <Calendar size={14} />{' '}
                      {new Date(blogPosts[0].createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="blog-dot">·</span>
                    <span>
                      <Clock size={14} /> 5 phút đọc
                    </span>
                  </div>
                  <Link to={`/blog/${blogPosts[0].slug}`}>
                    <h3>{blogPosts[0].title}</h3>
                  </Link>
                  {blogPosts[0].excerpt && <p>{blogPosts[0].excerpt}</p>}
                  {(blogPosts[0].tags || []).length > 0 && (
                    <div className="blog-featured-tags">
                      {(blogPosts[0].tags || []).slice(0, 3).map((tag, j) => (
                        <span key={j} className="blog-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link to={`/blog/${blogPosts[0].slug}`} className="blog-read-more">
                    Đọc bài viết <ArrowRight size={16} />
                  </Link>
                </div>
              </article>

              {/* Remaining posts grid */}
              {blogPosts.length > 1 && (
                <div className="blog-mini-grid">
                  {blogPosts.slice(1).map((post, i) => (
                    <article key={post.id} className={`blog-mini-card reveal-scale stagger-${i + 2}`}>
                      <Link to={`/blog/${post.slug}`} className="blog-mini-image">
                        {post.coverImage ? (
                          <img src={assetUrl(post.coverImage)} alt={post.title} loading="lazy" />
                        ) : (
                          <div className="blog-mini-fallback">
                            <FileText size={22} />
                          </div>
                        )}
                      </Link>
                      <div className="blog-mini-body">
                        <span className="blog-mini-date">
                          <Calendar size={12} />{' '}
                          {new Date(post.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                        </span>
                        <Link to={`/blog/${post.slug}`}>
                          <h4>{post.title}</h4>
                        </Link>
                        {post.excerpt && <p>{post.excerpt}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <div className="section-cta">
              <Link to="/blog" className="primary-btn">
                Xem tất cả bài viết <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        )}
        <footer role="contentinfo">
          © 2026 {siteSettings.brand}. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.
        </footer>
      </main>

      {/* Album Modal */}
      {album && (
        <AlbumModal
          album={album}
          albumIndex={albumIndex}
          setAlbumIndex={setAlbumIndex}
          selectedProduct={selectedProduct}
          onClose={() => {
            setAlbum(null)
            setSelectedProduct(null)
          }}
          siteSettings={siteSettings}
          onQuote={(productId, need) => {
            setLeadForm({ ...leadForm, productId, need })
            setAlbum(null)
            setSelectedProduct(null)
          }}
        />
      )}

      {/* About Image Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={assetUrl(lightbox.images[lightbox.index])} alt={`Giới thiệu ${lightbox.index + 1}`} />
          </div>
          {lightbox.images.length > 1 && (
            <>
              <button
                className="lightbox-prev"
                onClick={() => setLightbox((l) => ({ ...l, index: l.index === 0 ? l.images.length - 1 : l.index - 1 }))}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className="lightbox-next"
                onClick={() => setLightbox((l) => ({ ...l, index: l.index === l.images.length - 1 ? 0 : l.index + 1 }))}
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
      )}

      <div className="floating-actions">
        <a href={`tel:${siteSettings.hotline}`}>
          <Phone size={20} /> <span className="floating-label">Gọi</span>
        </a>
        <a className="zalo-icon-btn small-zalo" href={siteSettings.zalo} aria-label="Chat Zalo">
          <span>Zalo</span>
        </a>
      </div>
    </>
  )
}
