'use client'

import { useEffect, useState } from 'react'
import { StreamCard } from './stream-card'
import { Stream } from '@/types'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Video } from 'lucide-react'

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
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-ink-black/5 animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (streams.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <Video className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-ink mb-2">
          {liveOnly ? 'No live streams right now' : 'No streams found'}
        </h3>
        <p className="text-gray-500">
          {liveOnly ? 'Check back later or browse other categories!' : 'Try adjusting your filters.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {streams.map((stream, index) => (
        <motion.div
          key={stream.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <StreamCard stream={stream} />
        </motion.div>
      ))}
    </div>
  )
}
