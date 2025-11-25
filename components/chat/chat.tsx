'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Shield, Smile, MoreVertical, Heart, Gift } from 'lucide-react'
import { ChatMessage as ChatMessageType } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatProps {
  streamId: string
}

const EMOJIS = ['❤️', '😂', '🔥', '👏', '😮', '🎉', '👍', '👋']

export function Chat({ streamId }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    loadChatHistory()
    connectToChat()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [streamId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`/api/streams/${streamId}/chat`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const connectToChat = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('Chat WebSocket already connected or connecting')
      return
    }

    const chatUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8080'
    const ws = new WebSocket(`${chatUrl}/chat/${streamId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('Connected to chat')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages(prev => {
        const isDuplicate = prev.some(m => 
          m.content === message.content && 
          m.user?.id === message.user?.id &&
          Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000
        )
        
        if (isDuplicate) {
          console.log('Duplicate message detected, skipping')
          return prev
        }
        
        return [...prev, message]
      })
    }

    ws.onclose = () => {
      console.log('Disconnected from chat')
      setIsConnected(false)
      wsRef.current = null
      reconnectTimeoutRef.current = setTimeout(connectToChat, 3000)
    }

    ws.onerror = () => {
      console.warn('Chat WebSocket connection error - attempting to reconnect...')
    }
  }

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!newMessage.trim() || !session?.user) {
      return
    }

    const message = {
      type: 'chat-message',
      streamId,
      user: {
        id: session.user.id,
        username: session.user.username || session.user.name || 'User',
        name: session.user.name || session.user.username || 'User',
        avatar: session.user.image || null,
        isModerator: false
      },
      content: newMessage.trim(),
      createdAt: new Date().toISOString()
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      setNewMessage('')
      setShowEmojiPicker(false)
    }
  }

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = chatContainerRef.current
      // Only scroll if user is already near bottom
      if (scrollHeight - clientHeight - scrollTop < 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  return (
    <div className="flex flex-col h-[600px] relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border border-ink-black/10 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-ink-black/5 bg-white/50 backdrop-blur-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-ink text-lg">Live Chat</h3>
          <span className="px-2 py-0.5 bg-ink-black/5 rounded-full text-xs font-medium text-ink-light">
            {messages.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-full border border-red-100">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span className="text-xs font-medium text-red-700">Offline</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-ink-black/5 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-ink-light" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Pop out chat</DropdownMenuItem>
              <DropdownMenuItem>Toggle timestamps</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Report chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={`${message.createdAt}-${index}`}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="group flex items-start gap-3 hover:bg-ink-black/5 p-2 rounded-xl transition-colors -mx-2"
            >
              <div className="flex-shrink-0 mt-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                  message.user?.isModerator 
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                }`}>
                  {message.user?.avatar ? (
                    <img src={message.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    message.user?.name?.[0] || 'U'
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-bold text-sm ${
                    message.user?.isModerator ? 'text-purple-600' : 'text-ink'
                  }`}>
                    {message.user?.name || message.user?.username}
                  </span>
                  {message.user?.isModerator && (
                    <Shield className="w-3 h-3 text-purple-500 fill-purple-500" />
                  )}
                  <span className="text-[10px] text-ink-light opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-ink-dark leading-relaxed break-words">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-ink-black/5 bg-white/50 backdrop-blur-sm">
        {session ? (
          <div className="relative">
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-xl shadow-xl border border-ink-black/10 grid grid-cols-4 gap-1 w-64 z-20"
                >
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-xl transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={sendMessage} className="flex items-end gap-2">
              <div className="flex-1 bg-gray-50 border border-ink-black/10 rounded-xl focus-within:border-ink-blue/50 focus-within:ring-2 focus-within:ring-ink-blue/10 transition-all flex items-center p-1">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-ink-blue hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-ink placeholder:text-gray-400"
                  maxLength={500}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="p-3 bg-ink-blue text-white rounded-xl shadow-lg shadow-ink-blue/20 hover:shadow-xl hover:shadow-ink-blue/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
            
            <div className="flex justify-between mt-2 px-1">
              <div className="flex gap-1">
                <button className="p-1.5 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                  <Gift className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[10px] text-gray-400 py-1.5">
                {newMessage.length}/500
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Log in to join the conversation</p>
            <button className="text-sm font-bold text-ink-blue hover:underline">
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
