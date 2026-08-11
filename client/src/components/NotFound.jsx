import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../seo'

export default function NotFound() {
  useEffect(() => setPageMeta({ title: 'Không tìm thấy trang | Xe Nâng Bắc Ninh', description: 'Đường dẫn bạn truy cập không tồn tại.' }), [])
  return (
    <main className="detail-loading" id="not-found-page">
      <p>404</p>
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn có thể đã thay đổi hoặc không còn tồn tại.</p>
      <Link to="/" className="primary-btn" id="not-found-home-link">Về trang chủ</Link>
    </main>
  )
}
