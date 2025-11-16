'use client'

import { useState } from 'react'
import { Stream, User } from '@/types'
import { Broadcaster } from '@/components/streaming/broadcaster'
import { Chat } from '@/components/chat/chat'
import { Button } from '@/components/ui/button'
import { Eye, Circle, Settings } from 'lucide-react'
import { formatViewerCount } from '@/lib/utils'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'

interface DashboardContentProps {
  stream: Stream & { streamer: User }
  user: User
}

export function DashboardContent({ stream: initialStream, user }: DashboardContentProps) {
  const [stream, setStream] = useState(initialStream)
  const { toast } = useToast()

  const handleStart = async () => {
    try {
      const response = await axios.post(`/api/streams/${stream.id}/start`)
      setStream(response.data)
      toast({
        title: 'Stream Started',
        description: 'You are now live!'
      })
    } catch (error) {
      toast({
        title: 'Error',
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
        title: 'Stream Ended',
        description: 'Your stream has ended'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop stream',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="glass-dark rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Stream Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your live stream</p>
          </div>
          <div className="flex items-center space-x-4">
            {stream.isLive && (
              <div className="flex items-center space-x-2 bg-red-600 px-4 py-2 rounded-full animate-pulse">
                <Circle className="w-3 h-3 fill-white text-white" />
                <span className="font-bold text-white">LIVE</span>
              </div>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Viewers</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatViewerCount(stream.viewerCount)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Peak Viewers</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatViewerCount(stream.peakViewers)}
                </p>
              </div>
              <Circle className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stream.isLive ? 'Live' : 'Offline'}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full ${stream.isLive ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
          </div>
        </div>

        <div className="glass rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-white mb-2">Stream Info</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-400">Title</p>
              <p className="text-white">{stream.title}</p>
            </div>
            {stream.description && (
              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-white">{stream.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400">Stream URL</p>
              <p className="text-white font-mono text-sm">
                {typeof window !== 'undefined' ? window.location.origin : ''}/stream/{stream.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Broadcaster 
            streamId={stream.id}
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>

        <div className="lg:col-span-1">
          <Chat streamId={stream.id} />
        </div>
      </div>
    </div>
  )
}
