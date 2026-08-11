const DEFAULT_TITLE = 'Xe Nâng Bắc Ninh | Bán & Cho Thuê Xe Nâng'
const DEFAULT_DESCRIPTION = 'Bán, cho thuê, sửa chữa xe nâng và thiết bị kho tại Bắc Ninh và miền Bắc.'

function setMeta(selector, key, name, value) {
  let element = document.head.querySelector(selector)
  if (!value) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(key, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', value)
}

export function setPageMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, image } = {}) {
  document.title = title
  const url = `${window.location.origin}${window.location.pathname}`
  const canonical = document.head.querySelector('link[rel="canonical"]') || document.head.appendChild(document.createElement('link'))
  canonical.setAttribute('rel', 'canonical')
  canonical.setAttribute('href', url)
  setMeta('meta[name="description"]', 'name', 'description', description)
  setMeta('meta[property="og:title"]', 'property', 'og:title', title)
  setMeta('meta[property="og:description"]', 'property', 'og:description', description)
  setMeta('meta[property="og:url"]', 'property', 'og:url', url)
  setMeta('meta[property="og:image"]', 'property', 'og:image', image)
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image)
}

