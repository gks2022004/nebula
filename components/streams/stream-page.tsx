'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Stream, User } from '@/types'
import { Viewer } from '@/components/streaming/viewer'
import { Chat } from '@/components/chat/chat'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Heart, Share2, Circle } from 'lucide-react'
import { formatViewerCount } from '@/lib/utils'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'

interface StreamPageProps {
  stream: Stream & { streamer: User }
}

export function StreamPage({ stream: initialStream }: StreamPageProps) {
  const { data: session } = useSession()
  const [stream, setStream] = useState(initialStream)
  const [isFollowing, setIsFollowing] = useState(false)
  const { toast } = useToast()

  const handleFollow = async () => {
    if (!session) {
      toast({
        title: 'Login Required',
        description: 'Please login to follow streamers',
        variant: 'destructive'
      })
      return
    }

    try {
      if (isFollowing) {
        await axios.delete(`/api/users/${stream.streamerId}/follow`)
        setIsFollowing(false)
        toast({
          title: 'Unfollowed',
          description: `You unfollowed ${stream.streamer.name}`
        })
      } else {
        await axios.post(`/api/users/${stream.streamerId}/follow`)
        setIsFollowing(true)
        toast({
          title: 'Following',
          description: `You are now following ${stream.streamer.name}`
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive'
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: stream.title,
          text: `Watch ${stream.streamer.name} live on Nebula!`,
          url
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast({
        title: 'Link Copied',
        description: 'Stream link copied to clipboard'
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {stream.isLive ? (
            <Viewer 
              streamId={stream.id} 
              viewerId={session?.user?.id || `guest_${Math.random().toString(36).slice(2)}`}
            />
          ) : (
            <div className="glass-dark rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <Circle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Stream Offline</h3>
                <p className="text-gray-400">This stream is not currently live</p>
              </div>
            </div>
          )}

          <div className="glass-dark rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {stream.isLive && (
                    <div className="flex items-center space-x-1 bg-red-600 px-3 py-1 rounded-full">
                      <Circle className="w-2 h-2 fill-white text-white animate-pulse" />
                      <span className="text-xs font-bold text-white">LIVE</span>
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-white">{stream.title}</h1>
                </div>
                {stream.description && (
                  <p className="text-gray-300">{stream.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 ring-2 ring-purple-500">
                  <AvatarImage src={stream.streamer.avatar || ''} />
                  <AvatarFallback className="gradient-primary text-white">
                    {stream.streamer.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">{stream.streamer.name}</h3>
                  <p className="text-sm text-gray-400">@{stream.streamer.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? 'secondary' : 'default'}
                  className={!isFollowing ? 'gradient-primary' : ''}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {formatViewerCount(stream.viewerCount)} viewers
                </span>
              </div>
              {stream.category && (
                <span className="text-sm px-3 py-1 bg-white/10 rounded-full text-gray-300">
                  {stream.category}
                </span>
              )}
              {stream.tags && stream.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {stream.streamer.bio && (
            <div className="glass-dark rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">About</h3>
              <p className="text-gray-300">{stream.streamer.bio}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Chat streamId={stream.id} />
        </div>
      </div>
    </div>
  )
}
