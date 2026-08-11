import React, { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, ChevronDown, Clock, List, Share2, Tag, Truck } from 'lucide-react'
import { assetUrl } from '../api'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })

const normalizeHeadingId = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function buildArticleContent(content) {
  const document = new DOMParser().parseFromString(content, 'text/html')
  const headings = []
  const idCounts = new Map()

  document.body.querySelectorAll('h2, h3').forEach((heading) => {
    const text = heading.textContent.replace(/\s+/g, ' ').trim()
    if (!text) return

    const baseId = `muc-${normalizeHeadingId(text)}`
    const count = (idCounts.get(baseId) || 0) + 1
    const id = count === 1 ? baseId : `${baseId}-${count}`
    idCounts.set(baseId, count)
    heading.id = id
    heading.tabIndex = -1
    headings.push({ id, level: Number(heading.tagName.slice(1)), text })
  })

  return { headings, contentHtml: document.body.innerHTML }
}

function TocLinks({ headings, onSelect }) {
  return (
    <ul>
      {headings.map((heading) => (
        <li key={heading.id} className={`blog-article-toc-item blog-article-toc-item--h${heading.level}`}>
          <a href={`#${heading.id}`} onClick={(event) => onSelect(event, heading.id)}>
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function BlogArticle({ post, embedded = false }) {
  const [tocOpen, setTocOpen] = useState(false)
  const tocId = `blog-article-mobile-toc-${useId().replace(/:/g, '')}`
  const { headings, contentHtml } = useMemo(() => buildArticleContent(post.content || ''), [post.content])
  const hasToc = headings.length >= 2

  useEffect(() => setTocOpen(false), [post.content])

  const handleTocSelect = (event, id) => {
    event.preventDefault()
    const heading = document.getElementById(id)
    if (!heading) return

    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    heading.scrollIntoView({ behavior, block: 'start' })
    heading.focus({ preventScroll: true })
    setTocOpen(false)
  }

  return (
    <>
      <section className="blog-article-hero">
        <div className="blog-article-hero-bg" />
        <div className="blog-container blog-article-hero-content">
          {!embedded && (
            <div className="blog-article-breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/blog">Blog</Link>
              <span>/</span>
              <span className="blog-article-breadcrumb-current">{post.title}</span>
            </div>
          )}

          <div className="blog-article-header">
            {(post.tags || []).length > 0 && (
              <div className="blog-article-tags-top">
                {post.tags.map((tag, index) => (
                  <span key={index} className="blog-article-tag-top">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1>{post.title}</h1>
            <div className="blog-article-meta">
              <span>
                <Calendar size={15} /> {formatDate(post.createdAt)}
              </span>
              <span className="blog-article-meta-sep">·</span>
              <span>
                <Clock size={15} /> 7 phút đọc
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className={`blog-container blog-article-main${embedded && !hasToc ? ' blog-article-main--single' : ''}`}>
        <article className="blog-article">
          {post.coverImage && (
            <figure className="blog-article-cover">
              <img src={assetUrl(post.coverImage)} alt={post.title} />
            </figure>
          )}
          {post.excerpt && (
            <div className="blog-article-excerpt">
              <p>{post.excerpt}</p>
            </div>
          )}

          {hasToc && (
            <nav className="blog-article-toc blog-article-toc--mobile" aria-label="Mục lục bài viết">
              <button
                type="button"
                className="blog-article-toc-toggle"
                aria-expanded={tocOpen}
                aria-controls={tocId}
                onClick={() => setTocOpen((open) => !open)}
              >
                <List size={16} />
                <span>Mục lục bài viết</span>
                <ChevronDown
                  size={14}
                  className={`blog-article-toc-chevron${tocOpen ? ' blog-article-toc-chevron--open' : ''}`}
                />
              </button>
              <div
                id={tocId}
                className={`blog-article-toc-body${tocOpen ? ' blog-article-toc-body--open' : ''}`}
                hidden={!tocOpen}
              >
                <TocLinks headings={headings} onSelect={handleTocSelect} />
              </div>
            </nav>
          )}

          <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: contentHtml }} />

          {(post.tags || []).length > 0 && (
            <div className="blog-article-tags-footer">
              <Tag size={14} />
              {post.tags.map((tag, index) => (
                <span key={index} className="blog-article-tag-footer">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!embedded && (
            <div className="blog-article-share">
              <span>Chia sẻ bài viết:</span>
              <button
                type="button"
                className="blog-share-btn"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                title="Sao chép link"
              >
                <Share2 size={16} /> Sao chép link
              </button>
            </div>
          )}
        </article>

        {(!embedded || hasToc) && (
          <aside className="blog-article-sidebar blog-article-sidebar--toc">
            {hasToc && (
              <nav className="blog-article-toc blog-article-toc--desktop" aria-label="Mục lục bài viết">
                <div className="blog-article-toc-toggle">
                  <List size={16} />
                  <span>Mục lục bài viết</span>
                </div>
                <div className="blog-article-toc-body blog-article-toc-body--open">
                  <TocLinks headings={headings} onSelect={handleTocSelect} />
                </div>
              </nav>
            )}
            {!embedded && (
              <Link to="/blog" className="blog-sidebar-back">
                <ArrowLeft size={16} /> Tất cả bài viết
              </Link>
            )}
          </aside>
        )}

        {!embedded && (
          <aside className="blog-article-sidebar blog-article-sidebar--cta">
            <div className="blog-sidebar-cta">
              <div className="blog-sidebar-cta-icon">
                <Truck size={40} aria-hidden="true" />
              </div>
              <h3>Bạn cần tư vấn xe nâng?</h3>
              <p>Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn giải pháp phù hợp nhất cho doanh nghiệp bạn.</p>
              <Link to="/#quote" className="primary-btn blog-sidebar-cta-btn">
                Nhận báo giá <ArrowRight size={16} />
              </Link>

            </div>
          </aside>
        )}
      </main>

      {!embedded && (
        <section className="blog-article-bottom">
          <div className="blog-container">
            <Link to="/blog" className="blog-back-link">
              <ArrowLeft size={18} /> Xem tất cả bài viết
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
