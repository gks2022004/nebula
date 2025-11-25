'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Stream, User } from '@/types'
import { Viewer } from '@/components/streaming/viewer'
import { Chat } from '@/components/chat/chat'
import { Eye, Heart, Share2, Users, Radio } from 'lucide-react'
import { formatViewerCount } from '@/lib/utils'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface StreamPageProps {
  stream: Stream & { streamer: User; isFollowing?: boolean }
}

export function StreamPage({ stream: initialStream }: StreamPageProps) {
  const { data: session } = useSession()
  const [stream, setStream] = useState(initialStream)
  const [isFollowing, setIsFollowing] = useState(initialStream.isFollowing || false)
  const { toast } = useToast()

  const handleFollow = async () => {
    if (!session) {
      toast({
        title: '🔒 Login Required',
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
          title: '💔 Unfollowed',
          description: `You unfollowed ${stream.streamer.name}`
        })
      } else {
        await axios.post(`/api/users/${stream.streamerId}/follow`)
        setIsFollowing(true)
        toast({
          title: '💖 Following',
          description: `You are now following ${stream.streamer.name}`
        })
      }
    } catch (error) {
      toast({
        title: '❌ Error',
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
        title: '📋 Link Copied',
        description: 'Stream link copied to clipboard'
      })
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Player Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video group">
            {stream.isLive ? (
              <Viewer 
                streamId={stream.id} 
                viewerId={session?.user?.id || `guest_${Math.random().toString(36).slice(2)}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-black/95">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-ink-purple/20 blur-3xl rounded-full animate-pulse" />
                    <Radio className="w-24 h-24 text-ink-purple relative z-10 mx-auto opacity-50" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">Stream Offline</h3>
                    <p className="text-gray-400 text-lg">Check back later or follow to get notified!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stream Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-ink-black/5 p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {stream.isLive && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse">
                        Live
                      </span>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold text-ink leading-tight">
                      {stream.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-ink-light font-medium">
                    <span className="text-ink-blue hover:underline cursor-pointer">
                      {stream.category || 'Just Chatting'}
                    </span>
                    {stream.tags?.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                    isFollowing 
                      ? 'bg-gray-100 text-ink hover:bg-gray-200 shadow-gray-200/50' 
                      : 'bg-ink-purple text-white hover:bg-ink-purple/90 shadow-ink-purple/20'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFollowing ? 'fill-ink text-ink' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-2.5 bg-ink-purple text-white rounded-xl hover:bg-ink-purple/90 shadow-lg shadow-ink-purple/20 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gray-100 p-1 border-2 border-white shadow-lg overflow-hidden">
                    {stream.streamer.avatar ? (
                      <img src={stream.streamer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-ink-blue to-ink-purple flex items-center justify-center text-white font-bold text-xl">
                        {stream.streamer.name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  {stream.isLive && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-ink text-lg">{stream.streamer.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>@{stream.streamer.username}</span>
                    {stream.isLive && (
                      <span className="flex items-center gap-1 text-red-500 font-bold">
                        <Users className="w-4 h-4" />
                        {formatViewerCount(stream.viewerCount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-ink-black/5 p-8">
            <h3 className="text-xl font-bold text-ink mb-4">About {stream.streamer.name}</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {stream.streamer.bio || "No bio available yet."}
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-ink mb-1">12.5K</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Followers</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-ink mb-1">1.2M</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Views</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-2xl font-bold text-ink mb-1">4.8h</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Avg Stream</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="lg:col-span-1 h-[500px] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24">
          <div className="h-full bg-white rounded-2xl shadow-sm border border-ink-black/5 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
              <h3 className="font-bold text-ink flex items-center gap-2">
                Stream Chat
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Live</span>
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat streamId={stream.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
