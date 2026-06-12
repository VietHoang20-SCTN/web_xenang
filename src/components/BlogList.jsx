import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, Phone, Tag } from 'lucide-react'
import { api, assetUrl } from '../api'
import { useTheme } from '../hooks'

export default function BlogList() {
  const { theme, toggleTheme } = useTheme()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Blog | Xe Nâng Bắc Ninh'
    loadPosts(1)
  }, [])

  const loadPosts = async (p) => {
    setLoading(true)
    try {
      const data = await api(`/public/blog?page=${p}&limit=6`)
      setPosts(data.items || [])
      setTotalPages(data.totalPages || 1)
      setPage(p)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

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
          <Link to="/blog" className="active">Blog</Link>
          <Link to="/#contact">Liên hệ</Link>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Chuyển đổi chế độ sáng/tối">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a className="phone-link" href="tel:0900000000"><Phone size={18} />0900 000 000</a>
        </div>
      </header>

      <main className="detail-page">
        <div className="detail-breadcrumb">
          <Link to="/">Trang chủ</Link> / Blog
        </div>

        <div className="blog-hero">
          <h1>Blog Xe Nâng Bắc Ninh</h1>
          <p>Kiến thức, kinh nghiệm và tin tức về xe nâng, thiết bị kho và logistics.</p>
        </div>

        {loading ? (
          <div className="detail-loading"><div className="spinner" /><p>Đang tải bài viết...</p></div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <h2>Chưa có bài viết nào</h2>
            <p>Hãy quay lại sau để đọc những bài viết mới nhất về xe nâng và thiết bị kho.</p>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {posts.map(post => (
                <article key={post.id} className="blog-card">
                  {post.coverImage && (
                    <Link to={`/blog/${post.slug}`} className="blog-card-image">
                      <img src={assetUrl(post.coverImage)} alt={post.title} />
                    </Link>
                  )}
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span><Calendar size={14} /> {formatDate(post.createdAt)}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`}><h3>{post.title}</h3></Link>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <div className="blog-card-footer">
                      {(post.tags || []).length > 0 && (
                        <div className="blog-card-tags">
                          {(post.tags || []).map((t, i) => <span key={i} className="blog-tag"><Tag size={12} /> {t}</span>)}
                        </div>
                      )}
                      <Link to={`/blog/${post.slug}`} className="blog-read-more">Đọc tiếp <ArrowRight size={16} /></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="blog-pagination">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => loadPosts(i + 1)}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer>© 2026 Xe Nâng Bắc Ninh. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.</footer>
    </>
  )
}
