import React, { useEffect, useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import { ArrowRight, BarChart3, FileText, History, ImageUp, LogOut, Mail, MessageCircle, Moon, Plus, Settings, Sun, Truck } from 'lucide-react'
import { api } from '../api'
import { useTheme } from '../hooks'
import AdminProducts from './AdminProducts'
import AdminCategories from './AdminCategories'
import AdminServices from './AdminServices'
import AdminLeads from './AdminLeads'
import AdminSettings from './AdminSettings'
import AdminBlog from './AdminBlog'
import AdminAuditLog from './AdminAuditLog'
import { notify } from '../toast'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export default function AdminApp() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [tab, setTab] = useState('products')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [leads, setLeads] = useState([])
  const [settings, setSettings] = useState({ brand: '', hotline: '', zalo: '', email: '', address: '', mapEmbed: '', logo: '' })
  const [blogPosts, setBlogPosts] = useState([])

  // ── Idle timeout ──
  const idleRef = useRef(null)
  const resetIdle = () => {
    if (idleRef.current) clearTimeout(idleRef.current)
    idleRef.current = setTimeout(() => {
      notify.warning('Phiên đăng nhập đã hết hạn do không hoạt động.')
      doLogout()
    }, IDLE_TIMEOUT_MS)
  }
  useEffect(() => {
    if (!user) return
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetIdle))
    resetIdle()
    return () => events.forEach(e => window.removeEventListener(e, resetIdle))
  }, [user])

  // ── Check if already logged in via cookie ──
  useEffect(() => {
    api('/auth/me').then(u => {
      setUser(u)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const loadAdmin = async () => {
    const [adminCategories, adminProductsData, adminServices, adminLeadsData, adminSettings, adminBlog] = await Promise.all([
      api('/admin/categories'), api('/admin/products'), api('/admin/services'), api('/admin/leads'), api('/admin/site-settings'), api('/admin/blog')
    ])
    setCategories(adminCategories)
    setProducts(adminProductsData?.items || adminProductsData || [])
    setServices(adminServices)
    setLeads(adminLeadsData?.items || adminLeadsData || [])
    setSettings(adminSettings || settings)
    setBlogPosts(adminBlog?.items || adminBlog || [])
  }
  useEffect(() => { if (user) loadAdmin().catch(e => notify.error(e.message)) }, [user])

  const doLogin = async (event) => {
    event.preventDefault()
    flushSync(() => setLoadingLogin(true))
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(login) })
      setUser(result.user)
      notify.success(`Chào mừng ${result.user?.name || ''}!`)
    } catch (error) {
      notify.error(error.message)
    } finally {
      setLoadingLogin(false)
    }
  }

  const doLogout = async () => {
    try { await api('/auth/logout', { method: 'POST' }) } catch (_) {}
    setUser(null)
    notify.success('Đã đăng xuất.')
  }

  if (loading) return null

  if (!user) return (
    <main className="admin-login">
      <div className="login-container">
        <div className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-logo"><Truck size={32} /></div>
            <h2>Hệ thống quản trị</h2>
            <p>Quản lý sản phẩm, danh mục, dịch vụ và khách hàng tiềm năng cho website xe nâng.</p>
            <div className="login-features">
              <div className="login-feature"><BarChart3 size={18} /><span>Quản lý Lead & Pipeline</span></div>
              <div className="login-feature"><Truck size={18} /><span>CRUD Sản phẩm & Danh mục</span></div>
              <div className="login-feature"><Settings size={18} /><span>Cấu hình website linh hoạt</span></div>
              <div className="login-feature"><ImageUp size={18} /><span>Upload & nén ảnh tự động</span></div>
            </div>
          </div>
          <div className="login-brand-footer">
            <small>© 2026 Xe Nâng Bắc Ninh</small>
          </div>
        </div>
        <div className="login-form-panel">
          <form className="login-form" onSubmit={doLogin}>
            <div className="login-form-header">
              <h1>Đăng nhập</h1>
              <p>Nhập thông tin tài khoản admin để truy cập hệ thống.</p>
            </div>
            <div className="login-input-group">
              <label className="login-label"><Mail size={18} /><span>Email</span></label>
              <input type="email" required placeholder="admin@xenang.local" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} autoFocus />
            </div>
            <div className="login-input-group">
              <label className="login-label"><Settings size={18} /><span>Mật khẩu</span></label>
              <input type="password" required placeholder="••••••••••" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            </div>
            <button className="primary-btn login-submit" type="submit" disabled={loadingLogin}>
              {loadingLogin ? <span className="login-spinner" /> : null}
              {loadingLogin ? 'Đang đăng nhập...' : 'Đăng nhập'} <ArrowRight size={18} />
            </button>
            <a className="login-back-link" href="/">← Về trang chủ website</a>
          </form>
        </div>
      </div>
    </main>
  )

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <a className="brand" href="/"><Truck />Website</a>
        <nav className="sidebar-nav">
          <a className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}><Truck size={18} /> Sản phẩm</a>
          <hr />
          <a className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}><Plus size={18} /> Danh mục</a>
          <hr />
          <a className={tab === 'services' ? 'active' : ''} onClick={() => setTab('services')}><Settings size={18} /> Dịch vụ</a>
          <hr />
          <a className={tab === 'leads' ? 'active' : ''} onClick={() => setTab('leads')}><MessageCircle size={18} /> Lead</a>
          <hr />
          <a className={tab === 'blog' ? 'active' : ''} onClick={() => setTab('blog')}><FileText size={18} /> Blog</a>
          <hr />
          <a className={tab === 'audit' ? 'active' : ''} onClick={() => setTab('audit')}><History size={18} /> Nhật ký</a>
          <hr />
          <a className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}><Settings size={18} /> Cấu hình</a>
        </nav>
        <div className="sidebar-footer">
          <button className="theme-toggle-sidebar" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Sáng' : 'Tối'}
          </button>
          <button className="logout-btn" onClick={doLogout}><LogOut size={16} /> Đăng xuất</button>
        </div>
      </aside>
      <section className="admin-content">
        <div className="section-heading"><span>Admin CMS</span><h2>Quản trị website xe nâng</h2></div>
        {tab === 'products' && <AdminProducts products={products} categories={categories} onRefresh={loadAdmin} />}
        {tab === 'categories' && <AdminCategories categories={categories} onRefresh={loadAdmin} />}
        {tab === 'services' && <AdminServices services={services} onRefresh={loadAdmin} />}
        {tab === 'leads' && <AdminLeads leads={leads} onRefresh={loadAdmin} />}
        {tab === 'blog' && <AdminBlog posts={blogPosts} onRefresh={loadAdmin} />}
        {tab === 'audit' && <AdminAuditLog />}
        {tab === 'settings' && <AdminSettings settings={settings} onRefresh={loadAdmin} />}
      </section>
    </main>
  )
}