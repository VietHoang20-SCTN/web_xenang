import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PublicSite from './components/PublicSite'
import ProductDetail from './components/ProductDetail'
import ServiceDetail from './components/ServiceDetail'
import BlogList from './components/BlogList'
import BlogPost from './components/BlogPost'
import './styles.css'

// Admin panel is lazy-loaded — visitors never download admin code.
const AdminApp = React.lazy(() => import('./components/AdminApp'))

function AdminLoader() {
  return (
    <Suspense fallback={<div className="admin-loading"><div className="spinner" /><p>Đang tải quản trị...</p></div>}>
      <AdminApp />
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3500,
        success: { duration: 3000 },
        error: { duration: 5000 },
        className: 'toast-base',
      }}
    />
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/san-pham/:slug" element={<ProductDetail />} />
      <Route path="/dich-vu/:slug" element={<ServiceDetail />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/admin/*" element={<AdminLoader />} />
    </Routes>
  </BrowserRouter>
)
