'use client'

import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion'
import { Video, Users, Zap, Shield, Star, Pencil, Sparkles, Play } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRef, useState, useEffect } from 'react'

export function Hero() {
  const { data: session } = useSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const [particles, setParticles] = useState<Array<{x: number, y: number, duration: number, delay: number}>>([])

  useEffect(() => {
    setParticles([...Array(10)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5
    })))
  }, [])
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  const rotate1 = useTransform(scrollY, [0, 500], [0, 10])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Mouse move effect for 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    mouseX.set((clientX - left) / width - 0.5)
    mouseY.set((clientY - top) / height - 0.5)
  }

  const streamingLink = session ? '/dashboard' : '/register'
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden min-h-screen flex items-center py-20 perspective-1000"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: y1, rotate: rotate1 }}
          className="absolute top-20 left-10 text-8xl opacity-10 text-ink-blue"
        >
          ✿
        </motion.div>
        <motion.div 
          style={{ y: y2, rotate: -rotate1 }}
          className="absolute top-40 right-20 text-6xl opacity-10 text-ink-orange"
        >
          ★
        </motion.div>
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-20 text-7xl opacity-10 text-ink-purple"
        >
          ☁
        </motion.div>
        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 text-6xl opacity-10 text-ink-green"
        >
          ♪
        </motion.div>
        
        {/* Floating Particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-ink-black opacity-20"
            initial={{ 
              x: p.x, 
              y: p.y 
            }}
            animate={{ 
              y: [0, -100], 
              opacity: [0.2, 0] 
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              ease: "linear",
              delay: p.delay
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto text-center"
        >
          {/* Main Title with 3D Effect */}
          <div className="mb-12 relative">
            <motion.div
              style={{ 
                rotateX: useTransform(mouseY, [-0.5, 0.5], [5, -5]),
                rotateY: useTransform(mouseX, [-0.5, 0.5], [-5, 5]),
              }}
              className="inline-block perspective-1000"
            >
              <motion.h1 
                className="text-6xl md:text-[10rem] font-bold text-ink mb-4 hand-underline inline-block transform -rotate-2 tracking-tighter leading-none"
                initial={{ scale: 0.9, rotate: -5 }}
                animate={{ scale: 1, rotate: -2 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <span className="text-ink-blue">N</span>
                <span className="text-ink-purple">e</span>
                <span className="text-ink-red">b</span>
                <span className="text-ink-orange">u</span>
                <span className="text-ink-green">l</span>
                <span className="text-ink-teal">a</span>
              </motion.h1>
            </motion.div>
            
            <div className="flex items-center justify-center gap-6 mb-8 mt-6">
              <div className="sketch-divider w-24 opacity-50" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-10 h-10 text-ink-orange" fill="currentColor" />
              </motion.div>
              <div className="sketch-divider w-24 opacity-50" />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="sticky-note sticky-note-yellow inline-block mb-8 transform rotate-1 max-w-2xl mx-auto"
          >
            <p className="text-3xl md:text-4xl font-bold text-ink font-hand">
              Stream Beyond Limits ✨
            </p>
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🚀</div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-pencil-dark mb-16 max-w-3xl mx-auto font-sketch leading-relaxed"
          >
            The most <span className="highlight-text font-bold">authentic</span> live streaming platform. 
            Ultra-low-latency, real-time chat, and a community that feels like home.
          </motion.p>
          
          {/* CTA Buttons with Magnetic Effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-8 mb-24"
          >
            <Link href={streamingLink}>
              <motion.button 
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="hand-button hand-button-blue px-8 py-4 md:px-12 md:py-6 text-xl md:text-2xl flex items-center gap-4 transform -rotate-1 shadow-sketchy-lg group relative overflow-hidden w-full sm:w-auto justify-center"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Video className="w-6 h-6 md:w-8 md:h-8" />
                  {session ? 'Go to Dashboard' : 'Start Streaming'}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
            </Link>
            <Link href="/browse">
              <motion.button 
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="hand-button hand-button-pink px-8 py-4 md:px-12 md:py-6 text-xl md:text-2xl flex items-center gap-4 transform rotate-1 shadow-sketchy-lg group relative overflow-hidden w-full sm:w-auto justify-center"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                  Browse Live
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Cards with Stagger Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, label: 'Ultra-Low Latency', value: '<1s', color: 'paper-card-yellow', rotate: -2 },
              { icon: Video, label: 'WebRTC Powered', value: 'HD', color: 'paper-card-pink', rotate: 2 },
              { icon: Users, label: 'Real-Time Chat', value: 'Live', color: 'paper-card-blue', rotate: -1 },
              { icon: Shield, label: 'Secure & Safe', value: '100%', color: 'paper-card-green', rotate: 3 },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 50, rotate: feature.rotate * 2 }}
                animate={{ opacity: 1, y: 0, rotate: feature.rotate }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.9 + i * 0.15,
                  type: "spring",
                  bounce: 0.4
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 0,
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className={`${feature.color} p-8 cursor-pointer relative group`}
              >
                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-ink-black text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
                    WOW!
                  </div>
                </div>
                <feature.icon className="w-12 h-12 text-ink mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                <p className="text-sm text-pencil-dark font-bold mb-2 uppercase tracking-wider">{feature.label}</p>
                <p className="text-4xl font-bold text-ink font-hand">{feature.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <div className="hand-border p-2 bg-white hover:bg-paper-cream transition-colors">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-4 bg-ink-blue rounded-full mx-auto"
          />
        </div>
        <p className="text-pencil-dark text-sm mt-2 text-center font-bold">scroll down</p>
      </motion.div>
    </div>
  )
}

