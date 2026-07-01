import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Zap } from 'lucide-react'
import { useTheme } from '../hooks'
import { assetUrl } from '../api'

/**
 * Shared header nav used across all public pages (BlogList, BlogPost, ProductDetail, ServiceDetail).
 * Uses React Router navigate with state to signal PublicSite which section to scroll to.
 */
export default function PublicNav({ siteSettings = {}, currentPage }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const goToSection = (e, sectionId) => {
    e.preventDefault()
    if (window.location.pathname === '/' || window.location.pathname === '') {
      // Already on homepage — scroll directly
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Navigate to homepage, passing the target section via state
      navigate('/', { state: { scrollTo: sectionId } })
    }
  }

  return (
    <header className="site-header blog-site-header">
      <Link className="brand" to="/">
        {(theme === 'dark' ? (siteSettings.logoDark || siteSettings.logo) : (siteSettings.logo || siteSettings.logoDark))
          ? <img className="brand-logo" src={assetUrl(theme === 'dark' ? (siteSettings.logoDark || siteSettings.logo) : (siteSettings.logo || siteSettings.logoDark))} alt={siteSettings.brand} />
          : <Zap size={28} />
        }
      </Link>
      <nav className="desktop-nav">
        <a href="#about" className={currentPage === 'about' ? 'active' : ''} onClick={(e) => goToSection(e, 'about')}>Giới thiệu</a>
        <a href="#products" className={currentPage === 'products' ? 'active' : ''} onClick={(e) => goToSection(e, 'products')}>Sản phẩm</a>
        <a href="#services" className={currentPage === 'services' ? 'active' : ''} onClick={(e) => goToSection(e, 'services')}>Dịch vụ</a>
        <a href="#contact" className={currentPage === 'contact' ? 'active' : ''} onClick={(e) => goToSection(e, 'contact')}>Liên hệ</a>
        <Link to="/blog" className={currentPage === 'blog' ? 'active' : ''}>Blog</Link>
      </nav>
      <div className="header-actions">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Đổi theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <a className="phone-link" href="tel:0900000000"><Phone size={18} />0900 000 000</a>
      </div>
    </header>
  )
}
