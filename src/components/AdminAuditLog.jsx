import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { ChevronLeft, ChevronRight, Clock, LogIn, LogOut, Plus, Trash2, Edit } from 'lucide-react'

const ACTION_ICONS = {
  LOGIN: <LogIn size={14} />,
  LOGOUT: <LogOut size={14} />,
  CREATE: <Plus size={14} />,
  UPDATE: <Edit size={14} />,
  DELETE: <Trash2 size={14} />,
}

const ACTION_COLORS = {
  LOGIN: '#22c55e',
  LOGOUT: '#f59e0b',
  CREATE: '#3b82f6',
  UPDATE: '#8b5cf6',
  DELETE: '#ef4444',
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const loadLogs = async (p) => {
    setLoading(true)
    try {
      const res = await api(`/admin/audit-log?page=${p}&limit=30`)
      setLogs(res.items || [])
      setTotal(res.total)
      setTotalPages(res.totalPages)
      setPage(res.page)
    } catch (err) {
      // silently fail - probably no permission
    }
    setLoading(false)
  }

  useEffect(() => { loadLogs(1) }, [])

  return (
    <div className="admin-audit-log">
      <div className="audit-header">
        <h3><Clock size={18} /> Nhật ký hoạt động</h3>
        <span className="audit-total">{total} bản ghi</span>
      </div>

      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="audit-loading">Đang tải...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="audit-empty">Chưa có dữ liệu.</td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td className="audit-cell-time">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                <td className="audit-cell-user">{log.userEmail}</td>
                <td>
                  <span className="audit-action-badge" style={{ background: `${ACTION_COLORS[log.action] || '#666'}1a`, color: ACTION_COLORS[log.action] || '#666' }}>
                    {ACTION_ICONS[log.action] || <Clock size={14} />}
                    {log.action === 'CREATE' ? ' Tạo' : log.action === 'UPDATE' ? ' Sửa' : log.action === 'DELETE' ? ' Xoá' : log.action === 'LOGIN' ? ' Đăng nhập' : log.action === 'LOGOUT' ? ' Đăng xuất' : log.action}
                  </span>
                </td>
                <td className="audit-cell-entity">
                  {log.entity}
                  {log.entityId && <code className="audit-id">{log.entityId.slice(0, 8)}</code>}
                </td>
                <td className="audit-cell-ip"><code>{log.ip || '—'}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="audit-pagination">
          <button disabled={page <= 1} onClick={() => loadLogs(page - 1)}><ChevronLeft size={16} /> Trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => loadLogs(page + 1)}>Sau <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  )
}
