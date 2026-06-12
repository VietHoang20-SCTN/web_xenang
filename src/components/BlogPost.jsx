import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, Clock, Phone, Share2, Tag, Zap } from 'lucide-react'
import { api, assetUrl } from '../api'
import { useTheme } from '../hooks'

export default function BlogPost() {
  const { slug } = useParams()
  const { theme, toggleTheme } = useTheme()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [siteSettings, setSiteSettings] = useState({ brand: 'Xe Nâng Bắc Ninh' })

  useEffect(() => {
    (async () => {
      try {
        const p = await api(`/public/blog/${slug}`)
        setPost(p)
        document.title = `${p.title} | Blog Xe Nâng`
      } catch {
        setPost(null)
      } finally {
        setLoading(false)
      }
    })()
    api('/public/site-settings').then(s => setSiteSettings(s || {})).catch(() => {})
  }, [slug])

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="blog-post-loading-spinner" />
        <p>Đang tải bài viết...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="blog-post-loading">
        <h2>Không tìm thấy bài viết</h2>
        <p>Bài viết này có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Link to="/blog" className="primary-btn">← Xem tất cả bài viết</Link>
      </div>
    )
  }

  return (
    <div className="blog-post-page-wrapper">
      {/* ── Ambient ── */}
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className={`orb orb-${i + 1}`} />)}
      </div>

      {/* ── Header ── */}
      <header className="site-header blog-site-header">
        <Link className="brand" to="/">
          {(theme === 'dark' ? (siteSettings.logoDark || siteSettings.logo) : (siteSettings.logo || siteSettings.logoDark))
            ? <img className="brand-logo" src={assetUrl(theme === 'dark' ? (siteSettings.logoDark || siteSettings.logo) : (siteSettings.logo || siteSettings.logoDark))} alt={siteSettings.brand} />
            : <Zap size={28} />
          }
        </Link>
        <nav className="desktop-nav">
          <Link to="/#products">Sản phẩm</Link>
          <Link to="/#services">Dịch vụ</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/#about">Giới thiệu</Link>
          <Link to="/#contact">Liên hệ</Link>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Đổi theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a className="phone-link" href="tel:0900000000"><Phone size={18} />0900 000 000</a>
        </div>
      </header>

      {/* ── Article Hero ── */}
      <section className="blog-article-hero">
        <div className="blog-article-hero-bg" />
        <div className="blog-container blog-article-hero-content">
          <div className="blog-article-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span className="blog-article-breadcrumb-current">{post.title}</span>
          </div>

          <div className="blog-article-header">
            {(post.tags || []).length > 0 && (
              <div className="blog-article-tags-top">
                {(post.tags || []).map((t, i) => (
                  <span key={i} className="blog-article-tag-top">{t}</span>
                ))}
              </div>
            )}
            <h1>{post.title}</h1>
            <div className="blog-article-meta">
              <span><Calendar size={15} /> {formatDate(post.createdAt)}</span>
              <span className="blog-article-meta-sep">·</span>
              <span><Clock size={15} /> 7 phút đọc</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article Body ── */}
      <main className="blog-container blog-article-main">
        <article className="blog-article">
          {/* Cover Image */}
          {post.coverImage && (
            <figure className="blog-article-cover">
              <img src={assetUrl(post.coverImage)} alt={post.title} />
            </figure>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="blog-article-excerpt">
              <p>{post.excerpt}</p>
            </div>
          )}

          {/* Content */}
          <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

          {/* Tags Footer */}
          {(post.tags || []).length > 0 && (
            <div className="blog-article-tags-footer">
              <Tag size={14} />
              {(post.tags || []).map((t, i) => (
                <span key={i} className="blog-article-tag-footer">{t}</span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="blog-article-share">
            <span>Chia sẻ bài viết:</span>
            <button className="blog-share-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)} title="Sao chép link">
              <Share2 size={16} /> Sao chép link
            </button>
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="blog-article-sidebar">
          {/* Back to Blog */}
          <Link to="/blog" className="blog-sidebar-back">
            <ArrowLeft size={16} /> Tất cả bài viết
          </Link>

          {/* CTA Card */}
          <div className="blog-sidebar-cta">
            <div className="blog-sidebar-cta-icon">🚛</div>
            <h3>Bạn cần tư vấn xe nâng?</h3>
            <p>Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn giải pháp phù hợp nhất cho doanh nghiệp bạn.</p>
            <Link to="/#quote" className="primary-btn blog-sidebar-cta-btn">
              Nhận báo giá <ArrowRight size={16} />
            </Link>
            <a className="zalo-icon-btn blog-sidebar-zalo" href="https://zalo.me/0900000000" target="_blank" rel="noopener noreferrer">
              <span>Chat Zalo</span>
            </a>
          </div>
        </aside>
      </main>

      {/* ── Related / Back ── */}
      <section className="blog-article-bottom">
        <div className="blog-container">
          <Link to="/blog" className="blog-back-link">
            <ArrowLeft size={18} /> Xem tất cả bài viết
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="blog-footer">
        <div className="blog-container">
          <div className="blog-footer-content">
            <div className="blog-footer-brand">
              <Zap size={24} />
              <span>Xe Nâng Bắc Ninh</span>
            </div>
            <p>© 2026 Xe Nâng Bắc Ninh. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
