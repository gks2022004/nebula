'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Video, Users, Zap, Shield, Star, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function Hero() {
  const { data: session } = useSession()
  
  // If logged in, go to dashboard. Otherwise, go to register
  const streamingLink = session ? '/dashboard' : '/register'
  
  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 opacity-10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 opacity-10 blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400 opacity-10 blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center"
        >
          {/* Main Title with Glitch Effect */}
          <div className="mb-8">
            <h1 
              className="text-7xl md:text-9xl font-black mb-4 glitch text-glow-cyan uppercase tracking-tighter"
              data-text="NEBULA"
            >
              NEBULA
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-1 w-20 bg-cyan-400" />
              <Star className="w-8 h-8 text-yellow-400 animate-pulse" fill="#ffff00" />
              <div className="h-1 w-20 bg-pink-500" />
            </div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-4xl font-black mb-4 text-gradient-neo uppercase tracking-wide"
          >
            STREAM BEYOND LIMITS
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-bold"
          >
            ULTRA-LOW-LATENCY LIVE STREAMING • REAL-TIME CHAT • HD QUALITY
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-20"
          >
            <Link href={streamingLink}>
              <button className="neo-button px-12 py-6 text-xl flex items-center gap-3">
                <Video className="w-6 h-6" />
                {session ? 'GO TO DASHBOARD' : 'START STREAMING'}
              </button>
            </Link>
            <Link href="/browse">
              <button className="neo-button neo-button-pink px-12 py-6 text-xl flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                BROWSE LIVE
              </button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: 'ULTRA-LOW LATENCY', value: '<1s', color: 'neo-card' },
              { icon: Video, label: 'WEBRTC POWERED', value: 'HD', color: 'neo-card-pink' },
              { icon: Users, label: 'REAL-TIME CHAT', value: 'LIVE', color: 'neo-card-yellow' },
              { icon: Shield, label: 'SECURE & SAFE', value: '100%', color: 'neo-card-lime' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                className={`${feature.color} p-8 neo-border-hover cursor-pointer`}
              >
                <feature.icon className="w-12 h-12 text-white mx-auto mb-4" strokeWidth={3} />
                <p className="text-sm font-black text-gray-400 mb-2 tracking-wider">{feature.label}</p>
                <p className="text-3xl font-black text-white">{feature.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-4 border-white rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-cyan-400 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  )
}
