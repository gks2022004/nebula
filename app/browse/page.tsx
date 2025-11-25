'use client'

import { StreamGrid } from '@/components/streams/stream-grid'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Radio, Star, Pencil, Search, Filter, Gamepad2, Music, Mic, Coffee, Code } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Star },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'chatting', label: 'Just Chatting', icon: Coffee },
  { id: 'tech', label: 'Tech & Code', icon: Code },
  { id: 'creative', label: 'Creative', icon: Pencil },
]

export default function BrowsePage() {
  const { data: session } = useSession()
  const isStreamer = session?.user?.isStreamer
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-[#faf6eb] relative">
      {/* Header Section */}
      <div className="bg-white border-b border-ink-black/5 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center md:text-left"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-ink mb-4">
                Browse <span className="text-[#4361ee]">Live</span>
              </h1>
              <p className="text-xl text-ink-light">
                Discover amazing creators and join the community ✨
              </p>
            </motion.div>

            {isStreamer && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Link href="/dashboard">
                  <button className="px-8 py-4 bg-[#1a1a2e] text-white rounded-2xl font-bold shadow-lg shadow-[#1a1a2e]/20 hover:shadow-xl hover:shadow-[#1a1a2e]/30 transition-all flex items-center gap-3 group">
                    <Radio className="w-5 h-5 group-hover:animate-pulse" />
                    Go Live Now
                  </button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-[#4361ee] text-white shadow-lg shadow-[#4361ee]/20'
                      : 'bg-white border border-ink-black/10 text-ink hover:bg-gray-50'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search streams, games, or tags..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-ink-black/10 rounded-xl focus:ring-2 focus:ring-[#4361ee]/20 focus:border-[#4361ee] transition-all outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Featured Section */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-red-500 rounded-full" />
              <h2 className="text-2xl font-bold text-ink">Featured Live Streams</h2>
            </div>
            <StreamGrid liveOnly={true} limit={4} />
          </section>
        )}

        {/* All Streams Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-ink-blue rounded-full" />
              <h2 className="text-2xl font-bold text-ink">
                {searchQuery ? 'Search Results' : 'Recommended for You'}
              </h2>
            </div>
            <button className="flex items-center gap-2 text-ink-light hover:text-ink font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
          
          <StreamGrid limit={50} />
          
          {/* Loading State / Infinite Scroll Placeholder */}
          <div className="mt-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-ink-blue/20 border-t-ink-blue rounded-full animate-spin" />
          </div>
        </section>
      </div>
    </main>
  )
}
