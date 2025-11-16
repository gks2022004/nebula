'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User } from '@/types'

export function FeaturedStreamers() {
  const [streamers, setStreamers] = useState<User[]>([])

  useEffect(() => {
    // This would fetch featured streamers from API
    // For now, using placeholder data
    setStreamers([])
  }, [])

  if (streamers.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-white">Featured Streamers</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {streamers.map((streamer, i) => (
          <motion.div
            key={streamer.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link href={`/profile/${streamer.username}`}>
              <div className="glass-dark rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-purple-500">
                  <AvatarImage src={streamer.avatar || ''} />
                  <AvatarFallback className="gradient-primary text-white text-2xl">
                    {streamer.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-center font-semibold text-white truncate">
                  {streamer.name}
                </p>
                <p className="text-center text-sm text-gray-400 truncate">
                  @{streamer.username}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
