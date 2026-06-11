import React, { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, ImageUp, LogOut, Mail, MessageCircle, Moon, Plus, Settings, Sun, Truck } from 'lucide-react'
import { api, clearToken, getToken, setToken } from '../api'
import { useTheme } from '../hooks'
import AdminProducts from './AdminProducts'
import AdminCategories from './AdminCategories'
import AdminServices from './AdminServices'
import AdminLeads from './AdminLeads'
import AdminSettings from './AdminSettings'
import { notify } from '../toast'

export default function AdminApp() {
  const { theme, toggleTheme } = useTheme()
  const [token, updateToken] = useState(getToken())
  const [login, setLogin] = useState({ email: '', password: '' })
  const [tab, setTab] = useState('products')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [leads, setLeads] = useState([])
  const [settings, setSettings] = useState({ brand: '', hotline: '', zalo: '', email: '', address: '', mapEmbed: '', logo: '' })

  const loadAdmin = async () => {
    const [adminCategories, adminProductsData, adminServices, adminLeadsData, adminSettings] = await Promise.all([
      api('/admin/categories'), api('/admin/products'), api('/admin/services'), api('/admin/leads'), api('/admin/site-settings')
    ])
    setCategories(adminCategories)
    setProducts(adminProductsData?.items || adminProductsData || [])
    setServices(adminServices)
    setLeads(adminLeadsData?.items || adminLeadsData || [])
    setSettings(adminSettings || settings)
  }
  useEffect(() => { if (token) loadAdmin().catch((error) => notify.error(error.message)) }, [token])

  const doLogin = async (event) => {
    event.preventDefault()
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(login) })
      setToken(result.token); updateToken(result.token)
      notify.success(`Chào mừng ${result.user?.name || ''}!`)
    } catch (error) {
      notify.error(error.message)
    }
  }
  const logout = () => { clearToken(); updateToken(null); notify.success('Đã đăng xuất.') }

  if (!token) return (
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
              <input type="email" required placeholder="admin@xenang.local" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            </div>
            <div className="login-input-group">
              <label className="login-label"><Settings size={18} /><span>Mật khẩu</span></label>
              <input type="password" required placeholder="••••••••••" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            </div>
            <button className="primary-btn login-submit" type="submit">Đăng nhập <ArrowRight size={18} /></button>
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
          <a className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}><Settings size={18} /> Cấu hình</a>
        </nav>
        <div className="sidebar-footer">
          <button className="theme-toggle-sidebar" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Sáng' : 'Tối'}
          </button>
          <button className="logout-btn" onClick={logout}><LogOut size={16} /> Đăng xuất</button>
        </div>
      </aside>
      <section className="admin-content">
        <div className="section-heading"><span>Admin CMS</span><h2>Quản trị website xe nâng</h2></div>
        {tab === 'products' && <AdminProducts products={products} categories={categories} onRefresh={loadAdmin} />}
        {tab === 'categories' && <AdminCategories categories={categories} onRefresh={loadAdmin} />}
        {tab === 'services' && <AdminServices services={services} onRefresh={loadAdmin} />}
        {tab === 'leads' && <AdminLeads leads={leads} onRefresh={loadAdmin} />}
        {tab === 'settings' && <AdminSettings settings={settings} onRefresh={loadAdmin} />}
      </section>
    </main>
  )
}