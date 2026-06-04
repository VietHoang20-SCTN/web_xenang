import { useEffect, useRef, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

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
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}

export function useParallax() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      document.querySelectorAll('.parallax-slow').forEach(el => {
        el.style.transform = `translateY(${scrollY * 0.05}px)`
      })
      document.querySelectorAll('.parallax-medium').forEach(el => {
        el.style.transform = `translateY(${scrollY * 0.12}px)`
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}