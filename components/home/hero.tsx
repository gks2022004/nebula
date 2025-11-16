'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Video, Users, Zap, Shield } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-3xl" />
      
      <div className="relative px-8 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Stream Beyond Limits</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Ultra-low-latency live streaming with WebRTC. 
            Connect with your audience in real-time.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button asChild size="lg" className="gradient-primary text-lg px-8">
              <Link href="/register">
                <Video className="mr-2 h-5 w-5" />
                Start Streaming
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 border-white/20">
              <Link href="/browse">
                Browse Streams
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { icon: Zap, label: 'Ultra-Low Latency', value: '<1s' },
              { icon: Video, label: 'WebRTC Powered', value: 'HD Quality' },
              { icon: Users, label: 'Real-time Chat', value: 'Interactive' },
              { icon: Shield, label: 'Secure & Safe', value: 'Moderated' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-dark rounded-xl p-6"
              >
                <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-1">{feature.label}</p>
                <p className="text-xl font-bold text-white">{feature.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
