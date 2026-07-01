import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Phone, Search, X } from 'lucide-react'
import { api, assetUrl } from '../api'
import { notify } from '../toast'
import { categories as fallbackCategories, products as fallbackProducts } from '../data'
import PublicNav from './PublicNav'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [siteSettings, setSiteSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState('')
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', company: '', need: '' })
  const [submitting, setSubmitting] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const [cats, prod] = await Promise.all([
          api('/public/categories').catch(() => fallbackCategories),
          api(`/public/products/${slug}`)
        ])
        setCategories(cats)
        setProduct(prod)
        setMainImage(prod.image || '')
        document.title = `${prod.name} | Xe Nâng Bắc Ninh`
      } catch {
        const fb = fallbackProducts.find(p => p.id === slug)
        if (fb) {
          setProduct(fb)
          setMainImage(fb.image || '')
          document.title = `${fb.name} | Xe Nâng Bắc Ninh`
        }
      } finally {
        setLoading(false)
      }
    })()
    api('/public/site-settings').then(s => setSiteSettings(s || {})).catch(() => {})
  }, [slug])

  const submitLead = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api('/public/leads', { method: 'POST', body: JSON.stringify({ ...leadForm, productId: product?.id }) })
      notify.success('Đã gửi yêu cầu báo giá! Chúng tôi sẽ liên hệ sớm.')
      setLeadForm({ name: '', phone: '', company: '', need: '' })
    } catch (err) {
      notify.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="detail-loading"><div className="spinner" /><p>Đang tải...</p></div>
  if (!product) return <div className="detail-loading"><h2>Không tìm thấy sản phẩm</h2><Link to="/" className="primary-btn">← Về trang chủ</Link></div>

  const gallery = product.gallery || []
  const specs = product.specs || []
  const category = categories.find(c => c.id === product.categoryId || c.slug === product.categoryId)

  return (
    <>
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className={`orb orb-${i + 1}`} />)}
      </div>

      <PublicNav siteSettings={siteSettings} currentPage="products" />

      <main className="detail-page">
        <div className="detail-breadcrumb">
          <Link to="/">Trang chủ</Link> / <Link to="/#products">Sản phẩm</Link>
          {category && <span> / <Link to={`/?category=${category.slug || category.id}`}>{category.name}</Link></span>}
          <span> / {product.name}</span>
        </div>

        <div className="detail-layout">
          <div className="detail-gallery">
            <div className="detail-main-image" onClick={() => {
              const imgs = [product.image, ...gallery].filter(Boolean)
              setLightbox({ images: imgs, index: imgs.indexOf(mainImage) })
            }}>
              <img src={assetUrl(mainImage)} alt={product.name} />
              {product.tag && <span className="detail-tag">{product.tag}</span>}
              <div className="detail-zoom-hint"><Search size={16} /> Click để xem ảnh</div>
            </div>
            {(() => {
              const imgs = [product.image, ...gallery].filter(Boolean)
              if (imgs.length < 2) return null
              return (
                <div className="detail-thumb-grid">
                  {imgs.map((img, i) => (
                    <button key={i} className={`detail-thumb-card${img === mainImage ? ' active' : ''}`} onClick={() => setMainImage(img)}>
                      <img src={assetUrl(img)} alt={`${product.name} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Info */}
          <div className="detail-info">
            <h1>{product.name}</h1>
            {product.summary && <p className="detail-summary">{product.summary}</p>}

            {specs.length > 0 && (
              <div className="detail-specs">
                <h3>Thông số kỹ thuật</h3>
                <ul>
                  {specs.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {product.description && (
              <div className="detail-description">
                <h3>Mô tả chi tiết</h3>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Quote Form */}
            <div className="detail-quote" id="quote">
              <h3>Yêu cầu báo giá</h3>
              <form onSubmit={submitLead}>
                <input type="text" required placeholder="Họ và tên *" value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} />
                <input type="tel" required placeholder="Số điện thoại *" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} />
                <input type="text" placeholder="Công ty (không bắt buộc)" value={leadForm.company} onChange={e => setLeadForm({ ...leadForm, company: e.target.value })} />
                <textarea placeholder="Nhu cầu của bạn..." rows={3} value={leadForm.need} onChange={e => setLeadForm({ ...leadForm, need: e.target.value })} />
                <button className="primary-btn" type="submit" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu báo giá'} <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Product Detail Content — full width below the 2-col layout */}
        {product.content && (
          <div className="detail-content">
            <h2>Chi tiết sản phẩm</h2>
            <div className="detail-content-body" dangerouslySetInnerHTML={{ __html: product.content }} />
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}><X size={24} /></button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={assetUrl(lightbox.images[lightbox.index])} alt={lightbox.index} />
          </div>
          {lightbox.images.length > 1 && (
            <>
              <button className="lightbox-prev" onClick={() => setLightbox(l => ({ ...l, index: l.index === 0 ? l.images.length - 1 : l.index - 1 }))}><ChevronLeft size={28} /></button>
              <button className="lightbox-next" onClick={() => setLightbox(l => ({ ...l, index: l.index === l.images.length - 1 ? 0 : l.index + 1 }))}><ChevronRight size={28} /></button>
            </>
          )}
        </div>
      )}

      <footer>© 2026 Xe Nâng Bắc Ninh. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.</footer>
    </>
  )
}
