'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Star, Trophy } from 'lucide-react'

const MOCK_STREAMERS = [
  { id: '1', username: 'ninja_coder', name: 'Ninja Coder', viewers: '12.5k', category: 'Coding', color: 'bg-[#4361ee]' },
  { id: '2', username: 'pixel_artist', name: 'Pixel Artist', viewers: '8.2k', category: 'Art', color: 'bg-[#e63946]' },
  { id: '3', username: 'game_master', name: 'Game Master', viewers: '15.1k', category: 'Gaming', color: 'bg-[#9b5de5]' },
  { id: '4', username: 'music_vibes', name: 'Music Vibes', viewers: '5.6k', category: 'Music', color: 'bg-[#f77f00]' },
  { id: '5', username: 'tech_talks', name: 'Tech Talks', viewers: '3.4k', category: 'Tech', color: 'bg-[#2a9d8f]' },
  { id: '6', username: 'chill_zone', name: 'Chill Zone', viewers: '9.8k', category: 'Just Chatting', color: 'bg-[#00b4d8]' },
]

export function FeaturedStreamers() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {MOCK_STREAMERS.map((streamer, i) => (
        <motion.div
          key={streamer.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Link href={`/stream/${streamer.username}`}>
            <motion.div 
              whileHover={{ y: -8, rotate: i % 2 === 0 ? 1 : -1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-ink-black/5 hover:border-ink-black hover:shadow-[4px_4px_0px_#1a1a2e] transition-all group cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Decorative background blob */}
              <div className={`absolute top-0 left-0 w-full h-24 opacity-10 ${streamer.color}`} />
              
              <div className="relative mb-4 mt-2">
                <div className={`w-20 h-20 rounded-full ${streamer.color} p-1 border-2 border-white shadow-lg overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                    {streamer.name[0]}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#e63946] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white flex items-center gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>
              
              <h3 className="font-bold text-ink truncate w-full group-hover:text-[#4361ee] transition-colors text-lg">
                {streamer.name}
              </h3>
              <p className="text-xs font-medium text-gray-400 truncate w-full mb-3 uppercase tracking-wider">
                {streamer.category}
              </p>
              
              <div className="flex items-center gap-2 text-xs font-bold text-ink-light bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 group-hover:border-ink-black/10 transition-colors">
                <Users className="w-3 h-3" />
                {streamer.viewers}
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
