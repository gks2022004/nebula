export interface User {
  id: string
  email: string
  username: string
  name?: string
  avatar?: string
  bio?: string
  isStreamer: boolean
  isModerator: boolean
  isAdmin: boolean
  createdAt: Date
  followerCount?: number
  followingCount?: number
}

export interface Stream {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  streamKey: string
  isLive: boolean
  viewerCount: number
  peakViewers: number
  category?: string
  tags: string[]
  streamerId: string
  streamer?: User
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
}

export interface ChatMessage {
  id: string
  content: string
  isDeleted: boolean
  userId: string
  user?: User
  streamId: string
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: Date
}

export interface StreamAnalytics {
  id: string
  streamId: string
  viewerCount: number
  chatMessages: number
  uniqueViewers: number
  averageViewTime: number
  timestamp: Date
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate'
  streamId: string
  userId: string
  data: any
}

export interface SocketMessage {
  type: string
  payload: any
}
