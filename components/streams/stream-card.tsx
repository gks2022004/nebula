'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Stream } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Circle } from 'lucide-react'
import { formatViewerCount } from '@/lib/utils'

interface StreamCardProps {
  stream: Stream
}

export function StreamCard({ stream }: StreamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link href={`/stream/${stream.streamer?.username || stream.streamerId}`}>
        <div className="glass-dark rounded-xl overflow-hidden cursor-pointer">
          <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-pink-900">
            {stream.thumbnailUrl ? (
              <Image
                src={stream.thumbnailUrl}
                alt={stream.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Circle className="w-16 h-16 text-white/20" />
              </div>
            )}
            
            {stream.isLive && (
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-red-600 px-3 py-1 rounded-full">
                  <Circle className="w-2 h-2 fill-white text-white animate-pulse" />
                  <span className="text-xs font-bold text-white">LIVE</span>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/70 px-2 py-1 rounded">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">
                {formatViewerCount(stream.viewerCount)}
              </span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10 ring-2 ring-purple-500">
                <AvatarImage src={stream.streamer?.avatar || ''} />
                <AvatarFallback className="gradient-primary text-white">
                  {stream.streamer?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                  {stream.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  {stream.streamer?.name || stream.streamer?.username}
                </p>
                {stream.category && (
                  <p className="text-xs text-gray-500 mt-1">{stream.category}</p>
                )}
              </div>
            </div>

            {stream.tags && stream.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {stream.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
