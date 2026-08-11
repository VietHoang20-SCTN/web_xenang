import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollManager({ location: displayedLocation }) {
  const routerLocation = useLocation()
  const location = displayedLocation || routerLocation

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.hash, location.key, location.pathname])

  return null
}
