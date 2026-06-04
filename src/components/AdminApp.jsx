import React, { useEffect, useState } from 'react'
import { BarChart3, Building2, ImageUp, LogOut, Mail, MapPinned, MapPin, MessageCircle, Moon, Phone, Plus, Save, Settings, Sun, Truck } from 'lucide-react'
import { api, clearToken, getToken, setToken, uploadProductImage } from '../api'
import { emptyCategory, emptyProduct, emptyService, leadStatuses, serviceIcons } from '../constants'
import { useTheme } from '../hooks'
import AdminProducts from './AdminProducts'
import AdminCategories from './AdminCategories'
import AdminServices from './AdminServices'
import AdminLeads from './AdminLeads'
import AdminSettings from './AdminSettings'

export default function AdminApp() {
  const { theme, toggleTheme } = useTheme()
  const [token, updateToken] = useState(getToken())
  const [login, setLogin] = useState({ email: '', password: '' })
  const [tab, setTab] = useState('products')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [leads, setLeads] = useState([])
  const [settings, setSettings] = useState({ brand: '', hotline: '', zalo: '', email: '', address: '', mapEmbed: '' })

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
  useEffect(() => { if (token) loadAdmin().catch((error) => alert(error.message)) }, [token])

  const doLogin = async (event) => { event.preventDefault(); const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(login) }); setToken(result.token); updateToken(result.token) }
  const logout = () => { clearToken(); updateToken(null) }

  if (!token) return (
    <main className="admin-login">
      <form className="quote-form login-card" onSubmit={doLogin}>
        <h1>Đăng nhập admin</h1>
        <input placeholder="Email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
        <input type="password" placeholder="Mật khẩu" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
        <button className="primary-btn">Đăng nhập</button>
        <a href="/">Về website</a>
      </form>
    </main>
  )

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <a className="brand" href="/"><Truck />Website</a>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Sản phẩm</button>
        <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Danh mục</button>
        <button className={tab === 'services' ? 'active' : ''} onClick={() => setTab('services')}>Dịch vụ</button>
        <button className={tab === 'leads' ? 'active' : ''} onClick={() => setTab('leads')}>Lead</button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Cấu hình</button>
        <button className="theme-toggle-sidebar" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Sáng' : 'Tối'}
        </button>
        <button onClick={logout}><LogOut size={16} /> Đăng xuất</button>
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