'use client'

import { useEffect, useState } from 'react'
import { StreamCard } from './stream-card'
import { Stream } from '@/types'
import axios from 'axios'

interface StreamGridProps {
  liveOnly?: boolean
  category?: string
  limit?: number
}

export function StreamGrid({ liveOnly, category, limit = 20 }: StreamGridProps) {
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreams()
  }, [liveOnly, category])

  const fetchStreams = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (liveOnly) params.append('liveOnly', 'true')
      if (category) params.append('category', category)
      params.append('limit', limit.toString())

      const response = await axios.get(`/api/streams?${params}`)
      setStreams(response.data.streams)
    } catch (error) {
      console.error('Error fetching streams:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-dark rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (streams.length === 0) {
    return (
      <div className="glass-dark rounded-xl p-12 text-center">
        <p className="text-gray-400 text-lg">
          {liveOnly ? 'No live streams at the moment' : 'No streams found'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {streams.map((stream) => (
        <StreamCard key={stream.id} stream={stream} />
      ))}
    </div>
  )
}
