import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Injects the Crisp chat widget.
 * Only activates when VITE_CRISP_WEBSITE_ID is set in the environment.
 * Automatically identifies logged-in users.
 */
export default function CrispChat() {
  const { user } = useAuth()
  const websiteId = import.meta.env.VITE_CRISP_WEBSITE_ID

  // Inject Crisp script once
  useEffect(() => {
    if (!websiteId) return

    window.$crisp = window.$crisp || []
    window.CRISP_WEBSITE_ID = websiteId

    if (document.getElementById('crisp-script')) return

    const script = document.createElement('script')
    script.id = 'crisp-script'
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)
  }, [websiteId])

  // Identify user when they log in
  useEffect(() => {
    if (!websiteId || !window.$crisp) return
    if (user?.name) window.$crisp.push(['set', 'user:nickname', [user.name]])
    if (user?.email) window.$crisp.push(['set', 'user:email', [user.email]])
  }, [user, websiteId])

  return null
}
