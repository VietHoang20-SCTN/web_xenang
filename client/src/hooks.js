import { useEffect, useRef, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}

export function useScrollAnimations(deps = [], options = {}) {
  const observerRef = useRef(null)

  useEffect(() => {
    const {
      rootSelector = '.snap-main',
      selector = '.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-rotate, .reveal-blur, .reveal-clip',
      threshold = 0.08,
      rootMargin = '0px 0px -8% 0px',
      once = true,
    } = options
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const elements = document.querySelectorAll(selector)

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    observerRef.current?.disconnect()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          if (once) observer.unobserve(entry.target)
        })
      },
      { root: document.querySelector(rootSelector), threshold, rootMargin }
    )

    observerRef.current = observer
    elements.forEach((element) => {
      if (!element.classList.contains('is-visible')) observer.observe(element)
    })

    return () => observer.disconnect()
  }, deps)
}

export function useScrollProgress(rootSelector = '.snap-main') {
  const progressRef = useRef(null)

  useEffect(() => {
    const scrollRoot = document.querySelector(rootSelector)
    const target = scrollRoot || window
    let rafId = null
    const update = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        const scrollTop = scrollRoot ? scrollRoot.scrollTop : window.scrollY
        const scrollRange = scrollRoot
          ? scrollRoot.scrollHeight - scrollRoot.clientHeight
          : document.documentElement.scrollHeight - window.innerHeight
        progressRef.current?.style.setProperty(
          '--scroll-progress',
          `${scrollRange > 0 ? Math.min(100, (scrollTop / scrollRange) * 100) : 0}%`
        )
        rafId = null
      })
    }

    target.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()
    return () => {
      target.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [rootSelector])

  return progressRef
}

export function useParallax(rootSelector = '.snap-main') {
  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches
    if (reducedMotion || coarsePointer) return undefined

    const scrollRoot = document.querySelector(rootSelector)
    const target = scrollRoot || window
    const hero = document.getElementById('home')
    const slowElements = document.querySelectorAll('.parallax-slow')
    const mediumElements = document.querySelectorAll('.parallax-medium')
    let rafId = null

    const update = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        const rootTop = scrollRoot?.getBoundingClientRect().top || 0
        const heroTop = hero?.getBoundingClientRect().top || 0
        const offset = Math.max(-600, Math.min(600, rootTop - heroTop))
        slowElements.forEach((element) => element.style.setProperty('--parallax-y', `${offset * 0.035}px`))
        mediumElements.forEach((element) => element.style.setProperty('--parallax-y', `${offset * 0.07}px`))
        rafId = null
      })
    }

    target.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      target.removeEventListener('scroll', update)
      if (rafId) cancelAnimationFrame(rafId)
      ;[...slowElements, ...mediumElements].forEach((element) => element.style.removeProperty('--parallax-y'))
    }
  }, [rootSelector])
}
