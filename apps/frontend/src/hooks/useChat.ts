import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'

interface Message {
  id: string
  userId: string
  user: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  message: string
  createdAt: string
}

export function useChat(streamId: string, token: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token || !streamId) return

    // Connect to WebSocket
    socketRef.current = io(`${WS_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      // Join stream room
      socketRef.current?.emit('join_stream', { streamId })
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    socketRef.current.on('chat_history', (data: Message[]) => {
      setMessages(data)
    })

    socketRef.current.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    socketRef.current.on('message_deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    })

    return () => {
      socketRef.current?.emit('leave_stream', { streamId })
      socketRef.current?.disconnect()
    }
  }, [streamId, token])

  const sendMessage = (message: string) => {
    if (!socketRef.current || !isConnected) return

    socketRef.current.emit('send_message', {
      streamId,
      message,
    })
  }

  const deleteMessage = (messageId: string) => {
    if (!socketRef.current || !isConnected) return

    socketRef.current.emit('delete_message', {
      streamId,
      messageId,
    })
  }

  return {
    messages,
    isConnected,
    sendMessage,
    deleteMessage,
  }
}
