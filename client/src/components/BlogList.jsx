import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, Tag, Zap } from 'lucide-react'
import { api, assetUrl } from '../api'
import PublicNav from './PublicNav'

export default function BlogList() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [siteSettings, setSiteSettings] = useState({ brand: 'Xe Nâng Bắc Ninh' })

  useEffect(() => {
    document.title = 'Blog | Kiến thức Xe Nâng & Logistics'
    loadPosts(1)
    api('/public/site-settings').then(s => setSiteSettings(s || {})).catch(() => {})
  }, [])

  const loadPosts = async (p) => {
    setLoading(true)
    try {
      const data = await api(`/public/blog?page=${p}&limit=9`)
      setPosts(data.items || [])
      setTotalPages(data.totalPages || 1)
      setPage(p)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="blog-page">
      {/* ── Ambient Background ── */}
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => <span key={i} className={`orb orb-${i + 1}`} />)}
      </div>

      {/* ── Header ── */}
      <PublicNav siteSettings={siteSettings} currentPage="blog" />

      {/* ── Hero ── */}
      <section className="blog-hero-section">
        <div className="blog-hero-bg" />
        <div className="blog-hero-content">
          <span className="blog-hero-eyebrow">📝 Kiến thức & Kinh nghiệm</span>
          <h1>Blog Xe Nâng</h1>
          <p>Chia sẻ kiến thức chuyên sâu về xe nâng, thiết bị kho bãi và giải pháp logistics cho doanh nghiệp Việt Nam.</p>
          <div className="blog-hero-stats">
            <div className="blog-hero-stat">
              <span className="blog-hero-stat-number">{posts.length || '...'}</span>
              <span className="blog-hero-stat-label">Bài viết</span>
            </div>
            <div className="blog-hero-stat">
              <span className="blog-hero-stat-number">🚛</span>
              <span className="blog-hero-stat-label">Xe nâng</span>
            </div>
            <div className="blog-hero-stat">
              <span className="blog-hero-stat-number">📦</span>
              <span className="blog-hero-stat-label">Kho bãi</span>
            </div>
            <div className="blog-hero-stat">
              <span className="blog-hero-stat-number">⚙️</span>
              <span className="blog-hero-stat-label">Kỹ thuật</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <div className="blog-breadcrumb">
        <div className="blog-container">
          <Link to="/">Trang chủ</Link>
          <span className="blog-breadcrumb-sep">/</span>
          <span>Blog</span>
        </div>
      </div>

      {/* ── Posts Grid ── */}
      <main className="blog-container">
        {loading ? (
          <div className="blog-loading">
            <div className="blog-loading-spinner" />
            <p>Đang tải bài viết...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="blog-empty-full">
            <div className="blog-empty-full-icon">📝</div>
            <h2>Chưa có bài viết nào</h2>
            <p>Chúng tôi đang chuẩn bị những bài viết chất lượng về xe nâng và logistics. Hãy quay lại sau!</p>
            <Link to="/" className="primary-btn">← Về trang chủ</Link>
          </div>
        ) : (
          <>
            <div className="blog-masonry">
              {posts.map((post, i) => (
                <article key={post.id} className={`blog-masonry-card ${i === 0 ? 'featured' : ''}`}>
                  <Link to={`/blog/${post.slug}`} className="blog-masonry-image">
                    {post.coverImage ? (
                      <img src={assetUrl(post.coverImage)} alt={post.title} loading={i < 3 ? 'eager' : 'lazy'} />
                    ) : (
                      <div className="blog-masonry-image-fallback">
                        <Zap size={32} />
                      </div>
                    )}
                    <div className="blog-masonry-image-overlay" />
                  </Link>
                  <div className="blog-masonry-body">
                    <div className="blog-masonry-meta">
                      <span className="blog-masonry-date">
                        <Calendar size={13} /> {formatDate(post.createdAt)}
                      </span>
                      <span className="blog-masonry-read">
                        <Clock size={13} /> 5 phút đọc
                      </span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3>{post.title}</h3>
                    </Link>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <div className="blog-masonry-footer">
                      {(post.tags || []).length > 0 && (
                        <div className="blog-masonry-tags">
                          {(post.tags || []).slice(0, 3).map((t, j) => (
                            <span key={j} className="blog-masonry-tag"><Tag size={11} /> {t}</span>
                          ))}
                        </div>
                      )}
                      <Link to={`/blog/${post.slug}`} className="blog-masonry-link">
                        Đọc tiếp <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="blog-pagination-bar">
                <button
                  className="blog-page-btn"
                  disabled={page <= 1}
                  onClick={() => loadPosts(page - 1)}
                >
                  ← Trước
                </button>
                <div className="blog-page-numbers">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`blog-page-num ${page === i + 1 ? 'active' : ''}`}
                      onClick={() => loadPosts(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="blog-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => loadPosts(page + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Newsletter CTA ── */}
      <section className="blog-newsletter">
        <div className="blog-container">
          <div className="blog-newsletter-card">
            <div className="blog-newsletter-content">
              <h2>Đừng bỏ lỡ bài viết mới</h2>
              <p>Theo dõi blog của chúng tôi để cập nhật kiến thức mới nhất về xe nâng và thiết bị kho.</p>
            </div>
            <Link to="/#contact" className="primary-btn">
              Liên hệ tư vấn <ArrowRight size={18} />
            </Link>
          </div>
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
