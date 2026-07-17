import { useEffect } from 'react'

// Adds a noindex robots meta tag while the page is mounted, removes it on unmount
// so it doesn't leak onto the next page the user navigates to (SPA, no full reload)
export const useNoIndex = () => {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => {
      document.head.removeChild(meta)
    }
  }, [])
}
