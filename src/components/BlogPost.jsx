import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, Phone, Tag } from 'lucide-react'
import { api, assetUrl } from '../api'
import { useTheme } from '../hooks'

export default function BlogPost() {
  const { slug } = useParams()
  const { theme, toggleTheme } = useTheme()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const p = await api(`/public/blog/${slug}`)
        setPost(p)
        document.title = `${p.title} | Blog Xe Nâng Bắc Ninh`
      } catch {
        setPost(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) return <div className="detail-loading"><div className="spinner" /><p>Đang tải...</p></div>
  if (!post) return <div className="detail-loading"><h2>Không tìm thấy bài viết</h2><Link to="/blog" className="primary-btn">← Xem tất cả bài viết</Link></div>

  return (
    <>
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className={`orb orb-${i + 1}`} />)}
      </div>

      <header className="site-header">
        <Link className="brand" to="/"><ArrowLeft size={24} /></Link>
        <nav className="desktop-nav">
          <Link to="/#products">Sản phẩm</Link>
          <Link to="/#services">Dịch vụ</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/#contact">Liên hệ</Link>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Chuyển đổi chế độ sáng/tối">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a className="phone-link" href="tel:0900000000"><Phone size={18} />0900 000 000</a>
        </div>
      </header>

      <main className="detail-page blog-post-page">
        <div className="detail-breadcrumb">
          <Link to="/">Trang chủ</Link> / <Link to="/blog">Blog</Link> / {post.title}
        </div>

        <article className="blog-post-content">
          <header className="blog-post-header">
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              <span><Calendar size={16} /> {formatDate(post.createdAt)}</span>
              {(post.tags || []).length > 0 && (
                <div className="blog-post-tags">
                  {(post.tags || []).map((t, i) => <span key={i} className="blog-tag"><Tag size={12} /> {t}</span>)}
                </div>
              )}
            </div>
          </header>

          {post.coverImage && (
            <div className="blog-post-cover">
              <img src={assetUrl(post.coverImage)} alt={post.title} />
            </div>
          )}

          {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}

          <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

          <div className="blog-post-cta">
            <h3>Bạn cần tư vấn về xe nâng?</h3>
            <p>Liên hệ ngay với chúng tôi để được tư vấn miễn phí về giải pháp xe nâng và thiết bị kho.</p>
            <div className="blog-post-cta-actions">
              <Link to="/#quote" className="primary-btn">Nhận báo giá <ArrowRight size={18} /></Link>
              <a className="zalo-icon-btn" href="https://zalo.me/0900000000" aria-label="Chat Zalo"><span>Zalo</span></a>
            </div>
          </div>
        </article>
      </main>

      <footer>© 2026 Xe Nâng Bắc Ninh. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.</footer>
    </>
  )
}
