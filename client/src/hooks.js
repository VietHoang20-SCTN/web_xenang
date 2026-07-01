import { useEffect, useRef, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return { theme, toggleTheme }
}

export function useScrollAnimations(deps = []) {
  const observerRef = useRef(null)

  useEffect(() => {
    const animationClasses = [
      'reveal', 'reveal-scale', 'reveal-left', 'reveal-right',
      'reveal-rotate', 'reveal-blur', 'reveal-clip'
    ]
    const selector = animationClasses.map(c => `.${c}`).join(',')

    if (observerRef.current) observerRef.current.disconnect()

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0, rootMargin: '0px 0px -20px 0px' })

    observerRef.current = observer

    // Small delay to ensure DOM is updated after render
    const timer = setTimeout(() => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.classList.contains('is-visible')) {
          observer.observe(el)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, deps)
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId = null
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
        const newProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
        setProgress(newProgress)
        rafId = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return progress
}

export function useParallax() {
  useEffect(() => {
    let rafId = null
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const slowEls = document.querySelectorAll('.parallax-slow')
        const medEls = document.querySelectorAll('.parallax-medium')
        for (let i = 0; i < slowEls.length; i++) {
          slowEls[i].style.transform = `translate3d(0, ${scrollY * 0.05}px, 0)`
        }
        for (let i = 0; i < medEls.length; i++) {
          medEls[i].style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`
        }
        rafId = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])
}