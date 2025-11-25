'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Stream } from '@/types'
import { Eye, Circle, Play, Heart, MessageCircle } from 'lucide-react'
import { formatViewerCount } from '@/lib/utils'

interface StreamCardProps {
  stream: Stream
}

export function StreamCard({ stream }: StreamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative"
    >
      <Link href={`/stream/${stream.streamer?.username || stream.streamerId}`}>
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          {/* Thumbnail Container */}
          <div className="relative aspect-video overflow-hidden">
            {stream.thumbnailUrl ? (
              <Image
                src={stream.thumbnailUrl}
                alt={stream.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-6xl opacity-20 grayscale">📺</span>
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Live Badge */}
            {stream.isLive && (
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </motion.div>
              </div>
            )}
            
            {/* Viewer Count */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                {formatViewerCount(stream.viewerCount)}
              </div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-lg"
              >
                <Play className="w-5 h-5 text-white fill-white ml-1" />
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {stream.streamer?.image ? (
                      <Image 
                        src={stream.streamer.image} 
                        alt={stream.streamer.name || ''} 
                        width={40} 
                        height={40}
                      />
                    ) : (
                      <span className="font-bold text-gray-600 text-sm">
                        {stream.streamer?.name?.[0] || 'U'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors leading-tight mb-1">
                  {stream.title}
                </h3>
                <p className="text-sm text-gray-500 truncate mb-2">
                  {stream.streamer?.name || stream.streamer?.username}
                </p>
                
                <div className="flex items-center justify-between">
                  {stream.category && (
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      {stream.category}
                    </span>
                  )}
                  
                  {/* Tags */}
                  {stream.tags && stream.tags.length > 0 && (
                    <div className="flex gap-1">
                      {stream.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
