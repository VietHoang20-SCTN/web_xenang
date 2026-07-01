import toast from 'react-hot-toast'
import React from 'react'

// Simple wrappers around react-hot-toast so the rest of the app doesn't import it directly.
// This makes it easy to swap toast libraries later if needed.
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast(message),
  loading: (message) => toast.loading(message),
  dismiss: (id) => toast.dismiss(id),
}

// Promise-based confirm dialog rendered as a toast with two buttons.
// Replaces native window.confirm() which is blocking and visually outdated.
// Usage: const ok = await confirmDialog('Xóa sản phẩm này?'); if (ok) { ... }
export function confirmDialog(message, { confirmLabel = 'Xác nhận', cancelLabel = 'Hủy' } = {}) {
  return new Promise((resolve) => {
    const id = toast(
      (t) => (
        React.createElement('div', { className: 'toast-confirm' },
          React.createElement('p', null, message),
          React.createElement('div', { className: 'toast-confirm-actions' },
            React.createElement('button', {
              className: 'toast-btn-cancel',
              onClick: () => { toast.dismiss(t.id); resolve(false) }
            }, cancelLabel),
            React.createElement('button', {
              className: 'toast-btn-confirm',
              onClick: () => { toast.dismiss(t.id); resolve(true) }
            }, confirmLabel)
          )
        )
      ),
      { duration: Infinity, position: 'top-center' }
    )
    return id
  })
}
