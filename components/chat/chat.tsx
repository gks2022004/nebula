'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatMessage as ChatMessageType } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import axios from 'axios'

interface ChatProps {
  streamId: string
}

export function Chat({ streamId }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Cleanup any existing connection first
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
    // Don't create a new connection if one already exists and is open
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
      // Prevent duplicate messages by checking if it already exists
      setMessages(prev => {
        // Check if message with same content and timestamp already exists
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
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connectToChat, 3000)
    }

    ws.onerror = () => {
      // WebSocket connection error - will attempt to reconnect
      console.warn('Chat WebSocket connection error - attempting to reconnect...')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !session?.user) {
      console.log('Cannot send message:', { hasMessage: !!newMessage.trim(), hasSession: !!session?.user })
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

    console.log('Sending chat message:', message)
    console.log('WebSocket state:', wsRef.current?.readyState)

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      console.log('Message sent via WebSocket')
      // Don't add optimistically - wait for broadcast from server
      setNewMessage('')
    } else {
      console.error('WebSocket not open. State:', wsRef.current?.readyState)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="glass-dark rounded-xl flex flex-col h-[600px]">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-white flex items-center justify-between">
          <span>Live Chat</span>
          {isConnected && (
            <span className="flex items-center text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
              Connected
            </span>
          )}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div key={index} className="flex items-start space-x-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={message.user?.avatar || ''} />
              <AvatarFallback className="text-xs bg-purple-600">
                {message.user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">
                  {message.user?.name || message.user?.username}
                </span>
                {message.user?.isModerator && (
                  <Shield className="w-3 h-3 text-blue-400" />
                )}
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-300 break-words">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        {session ? (
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              className="gradient-primary"
              disabled={!newMessage.trim() || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <p className="text-center text-gray-400 text-sm">
            Please login to chat
          </p>
        )}
      </div>
    </div>
  )
}
