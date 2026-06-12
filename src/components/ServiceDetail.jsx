import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import { api } from '../api'
import { notify } from '../toast'
import { services as fallbackServices } from '../data'
import PublicNav from './PublicNav'

export default function ServiceDetail() {
  const { slug } = useParams()
  const [service, setService] = useState(null)
  const [siteSettings, setSiteSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', company: '', need: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const svc = await api(`/public/services/${slug}`)
        setService(svc)
        document.title = `${svc.title} | Xe Nâng Bắc Ninh`
      } catch {
        const fb = fallbackServices.find(s => {
          const fbSlug = s.title.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          return fbSlug === slug
        })
        if (fb) {
          setService(fb)
          document.title = `${fb.title} | Xe Nâng Bắc Ninh`
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
      await api('/public/leads', { method: 'POST', body: JSON.stringify({ ...leadForm, need: leadForm.need || service?.title }) })
      notify.success('Đã gửi yêu cầu! Chúng tôi sẽ liên hệ sớm.')
      setLeadForm({ name: '', phone: '', company: '', need: '' })
    } catch (err) {
      notify.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="detail-loading"><div className="spinner" /><p>Đang tải...</p></div>
  if (!service) return <div className="detail-loading"><h2>Không tìm thấy dịch vụ</h2><Link to="/" className="primary-btn">← Về trang chủ</Link></div>

  return (
    <>
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} className={`orb orb-${i + 1}`} />)}
      </div>

      <PublicNav siteSettings={siteSettings} currentPage="services" />

      <main className="detail-page">
        <div className="detail-breadcrumb">
          <Link to="/">Trang chủ</Link> / <Link to="/#services">Dịch vụ</Link> / {service.title}
        </div>

        <div className="detail-layout service-detail-layout">
          <div className="detail-info service-detail-info">
            <h1>{service.title}</h1>
            {service.description && <p className="detail-summary">{service.description}</p>}

            {service.content && (
              <div className="detail-description">
                <h3>Chi tiết dịch vụ</h3>
                <div dangerouslySetInnerHTML={{ __html: service.content }} />
              </div>
            )}

            <div className="detail-quote" id="quote">
              <h3>Yêu cầu tư vấn dịch vụ</h3>
              <form onSubmit={submitLead}>
                <input type="text" required placeholder="Họ và tên *" value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} />
                <input type="tel" required placeholder="Số điện thoại *" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} />
                <input type="text" placeholder="Công ty (không bắt buộc)" value={leadForm.company} onChange={e => setLeadForm({ ...leadForm, company: e.target.value })} />
                <textarea placeholder="Nhu cầu của bạn..." rows={3} value={leadForm.need} onChange={e => setLeadForm({ ...leadForm, need: e.target.value })} />
                <button className="primary-btn" type="submit" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'} <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer>© 2026 Xe Nâng Bắc Ninh. Website bán & cho thuê xe nâng cho doanh nghiệp kho vận.</footer>
    </>
  )
}
