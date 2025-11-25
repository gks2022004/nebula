'use client'

import { useState, useEffect } from 'react'
import { Stream, User } from '@/types'
import { Broadcaster } from '@/components/streaming/broadcaster'
import { Chat } from '@/components/chat/chat'
import { Eye, Circle, Settings, Copy, Check, TrendingUp, Clock, Users, Activity } from 'lucide-react'
import { formatViewerCount } from '@/lib/utils'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface DashboardContentProps {
  stream: Stream & { streamer: User }
  user: User
}

export function DashboardContent({ stream: initialStream, user }: DashboardContentProps) {
  const [stream, setStream] = useState(initialStream)
  const [streamUrl, setStreamUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setStreamUrl(`${window.location.origin}/stream/${stream.streamer?.username || stream.streamerId}`)
  }, [stream.streamer?.username, stream.streamerId])

  const handleStart = async () => {
    try {
      const response = await axios.post(`/api/streams/${stream.id}/start`)
      setStream(response.data)
      toast({
        title: '🎬 Stream Started!',
        description: 'You are now live!'
      })
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to start stream',
        variant: 'destructive'
      })
    }
  }

  const handleStop = async () => {
    try {
      const response = await axios.post(`/api/streams/${stream.id}/stop`)
      setStream(response.data)
      toast({
        title: '📴 Stream Ended',
        description: 'Your stream has ended'
      })
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to stop stream',
        variant: 'destructive'
      })
    }
  }

  const copyStreamUrl = () => {
    navigator.clipboard.writeText(streamUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = [
    {
      label: 'Current Viewers',
      value: formatViewerCount(stream.viewerCount),
      icon: Eye,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      trend: '+12%'
    },
    {
      label: 'Peak Viewers',
      value: formatViewerCount(stream.peakViewers),
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      trend: 'All time high'
    },
    {
      label: 'Stream Duration',
      value: stream.isLive ? '01:23:45' : 'Offline',
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      trend: 'Since start'
    },
    {
      label: 'Engagement',
      value: '98%',
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-50',
      trend: 'High'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-ink mb-2">Stream Dashboard</h1>
          <p className="text-ink-light">Manage your live stream and engage with your audience ✨</p>
        </div>
        <div className="flex items-center gap-3">
          {stream.isLive && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/20"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-bold">LIVE NOW</span>
            </motion.div>
          )}
          <Link href="/settings?tab=stream">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white border border-ink-black/10 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-ink font-medium"
            >
              <Settings className="h-4 w-4" />
              Settings
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-ink-black/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.trend.includes('+') || stat.trend === 'High' || stat.trend === 'All time high'
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-gray-50 text-gray-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-ink-light font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-ink">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stream & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stream Preview/Broadcaster */}
          <div className="bg-white rounded-2xl border border-ink-black/10 shadow-lg overflow-hidden">
            <Broadcaster 
              streamId={stream.id}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>

          {/* Stream Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl border border-ink-black/5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-ink text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-ink-blue" />
                Stream Info
              </h3>
              <button className="text-sm text-ink-blue font-medium hover:underline">Edit Info</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-ink-light uppercase tracking-wider mb-2 block">Title</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-ink-black/5 text-ink font-medium">
                  {stream.title}
                </div>
              </div>
              
              {stream.description && (
                <div>
                  <label className="text-xs font-bold text-ink-light uppercase tracking-wider mb-2 block">Description</label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-ink-black/5 text-ink text-sm leading-relaxed">
                    {stream.description}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-ink-light uppercase tracking-wider mb-2 block">Stream URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-ink-black/5 text-ink-light font-mono text-sm truncate">
                    {streamUrl || 'Loading...'}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyStreamUrl}
                    className="px-4 bg-[#9b5de5] text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:bg-[#8338ec] transition-all flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Chat streamId={stream.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
