// =================================================================
// DELIVERY CHAT — Customer ↔ Rider real-time chat via GetStream.io
// =================================================================
// Shown on OrderTracking (customer) and RiderDeliveryDetail (rider)
// only when order status reaches out_for_delivery / in_transit.

import { useState, useEffect, useRef } from 'react'
import { StreamChat } from 'stream-chat'
import { apiCall } from '../services/api'

// Singleton Stream client — one connection per browser session
const streamClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY)

/**
 * @param {string}   orderId   - MongoDB Order _id
 * @param {string}   label     - "Chat with Rider" | "Chat with Customer"
 * @param {function} onClose   - optional close handler
 */
function DeliveryChat({ orderId, label = 'Chat with Rider', onClose }) {
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [channel, setChannel]       = useState(null)
  const [connected, setConnected]   = useState(false)
  const [error, setError]           = useState(null)
  const [sending, setSending]       = useState(false)
  const currentUserIdRef            = useRef(null)
  const messagesEndRef              = useRef(null)
  const channelRef                  = useRef(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        // 1. Get Stream user token from our backend
        const tokenRes = await apiCall('/chats/stream/token')
        if (!tokenRes.success) throw new Error('Failed to get chat token')
        const { token, userId, name } = tokenRes.data
        currentUserIdRef.current = userId

        // 2. Connect user to Stream (idempotent — safe to call if already connected)
        if (!streamClient.userID) {
          await streamClient.connectUser({ id: userId, name }, token)
        }

        // 3. Ensure channel exists on Stream (backend creates it with both members)
        await apiCall(`/chats/stream/channel/${orderId}`, { method: 'POST' })

        // 4. Watch the channel — opens WS subscription
        const ch = streamClient.channel('messaging', `delivery-${orderId}`)
        const state = await ch.watch()

        if (!mounted) return

        channelRef.current = ch
        setMessages(state.messages || [])
        setChannel(ch)
        setConnected(true)

        // 5. Listen for new messages in real-time
        ch.on('message.new', (event) => {
          if (mounted) setMessages(prev => [...prev, event.message])
        })
      } catch (err) {
        if (mounted) setError('Could not connect to chat. Please try again.')
        if (import.meta.env.DEV) console.error('[DeliveryChat]', err)
      }
    }

    init()

    return () => {
      mounted = false
      // Unwatch channel on unmount — don't disconnect the client (shared session)
      if (channelRef.current) channelRef.current.stopWatching()
    }
  }, [orderId])

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !channel || sending) return
    setSending(true)
    try {
      await channel.sendMessage({ text: input.trim() })
      setInput('')
    } catch (_e) {
      // message will retry on re-render; keep input so user can resend
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
         style={{ height: '420px', width: '320px' }}>

      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="font-semibold text-sm">{label}</span>
          {connected && (
            <span className="w-2 h-2 rounded-full bg-green-300 inline-block" title="Connected" />
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none"
            aria-label="Close chat"
          >
            ×
          </button>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {!connected && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-red-500 mt-6 px-3">{error}</p>
        )}

        {connected && messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            No messages yet. Say hi! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMe = String(msg.user?.id) === String(currentUserIdRef.current)
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                isMe
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                {!isMe && (
                  <p className="text-xs font-semibold text-green-700 mb-0.5">
                    {msg.user?.name || 'Rider'}
                  </p>
                )}
                <p className="leading-snug">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 p-2 flex gap-2 bg-white flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? 'Type a message…' : 'Connecting…'}
          disabled={!connected}
          className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !input.trim() || sending}
          className="bg-green-600 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 rotate-90">
            <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default DeliveryChat
