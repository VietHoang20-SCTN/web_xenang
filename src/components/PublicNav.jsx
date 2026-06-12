import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Zap } from 'lucide-react'
import { useTheme } from '../hooks'
import { assetUrl } from '../api'

/**
 * Shared header nav used across all public pages (BlogList, BlogPost, ProductDetail, ServiceDetail).
 * Uses React Router navigate for cross-page hash navigation so the browser scrolls to the
 * correct section even when coming from a different route.
 */
export default function PublicNav({ siteSettings = {}, currentPage }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const navLink = (href, label, isActive) => {
    const id = href.split('#')[1]
    const handleClick = (e) => {
      e.preventDefault()
      if (window.location.pathname === '/' || window.location.pathname === '') {
        // Already on homepage, just scroll smoothly
        if (id) {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        // Navigate to homepage with hash — PublicSite will handle the scroll
        navigate(`/#${id}`, { replace: true })
      }
    }
    return <a href={href} className={isActive ? 'active' : ''} onClick={handleClick}>{label}</a>
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
        {navLink('/#products', 'Sản phẩm', currentPage === 'products')}
        {navLink('/#services', 'Dịch vụ', currentPage === 'services')}
        <Link to="/blog" className={currentPage === 'blog' ? 'active' : ''}>Blog</Link>
        {navLink('/#about', 'Giới thiệu', currentPage === 'about')}
        {navLink('/#contact', 'Liên hệ', currentPage === 'contact')}
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
