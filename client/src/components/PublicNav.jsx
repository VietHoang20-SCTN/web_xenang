import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, Zap } from 'lucide-react'
import { useTheme } from '../hooks'
import { assetUrl } from '../api'

export default function PublicNav({ siteSettings = {}, currentPage }) {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const wasMenuOpen = useRef(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpen.current) menuButtonRef.current?.focus()
      wasMenuOpen.current = false
      return
    }

    wasMenuOpen.current = true
    const dialog = closeButtonRef.current?.parentElement
    const siblings = [...(dialog?.parentElement?.children || [])].filter((element) => element !== dialog)
    const inertStates = siblings.map((element) => [element, element.inert])
    siblings.forEach((element) => {
      element.inert = true
    })
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
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
  }, [menuOpen])

  return (
    <>
      <header className="site-header blog-site-header">
        <Link className="brand" to="/#home">
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
        </Link>
        <nav className="desktop-nav">
          <Link to="/#home" className={currentPage === 'home' ? 'active' : ''}>
            Trang chủ
          </Link>
          <Link to="/#about" className={currentPage === 'about' ? 'active' : ''}>
            Giới thiệu
          </Link>
          <Link to="/#products" className={currentPage === 'products' ? 'active' : ''}>
            Sản phẩm
          </Link>
          <Link to="/#services" className={currentPage === 'services' ? 'active' : ''}>
            Dịch vụ
          </Link>
          <Link to="/#contact" className={currentPage === 'contact' ? 'active' : ''}>
            Liên hệ
          </Link>
          <Link to="/blog" className={currentPage === 'blog' ? 'active' : ''}>
            Blog
          </Link>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Đổi theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            ref={menuButtonRef}
            className="menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="public-mobile-menu"
          className="mobile-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Điều hướng chính"
        >
          <button ref={closeButtonRef} className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
            <X />
          </button>
          <Link
            to="/#home"
            className={currentPage === 'home' ? 'active' : ''}
            aria-current={currentPage === 'home' ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Trang chủ
          </Link>
          <Link to="/#about" onClick={() => setMenuOpen(false)}>
            Giới thiệu
          </Link>
          <Link
            to="/#products"
            className={currentPage === 'products' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Sản phẩm
          </Link>
          <Link
            to="/#services"
            className={currentPage === 'services' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Dịch vụ
          </Link>
          <Link to="/#contact" onClick={() => setMenuOpen(false)}>
            Liên hệ
          </Link>
          <Link
            to="/blog"
            className={currentPage === 'blog' ? 'active' : ''}
            aria-current={currentPage === 'blog' ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <a className="mobile-drawer-phone" href={`tel:${siteSettings.hotline || '0900000000'}`}>
            <Phone size={18} /> {siteSettings.hotline || '0900 000 000'}
          </a>
        </div>
      )}
    </>
  )
}
