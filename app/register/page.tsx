'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Video, ArrowRight, User, Mail, Lock, AtSign, Github } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    name: '',
    isStreamer: false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/auth/register', formData)
      
      toast({
        title: 'Success!',
        description: 'Account created successfully. Please sign in.'
      })
      
      router.push('/login')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Decoration */}
      <div className="hidden lg:block w-1/2 bg-[#faf6eb] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-lg aspect-square">
            {/* Animated blobs */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />

            {/* Content */}
            <div className="relative z-10 text-center space-y-8 p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50"
              >
                <h2 className="text-3xl font-bold text-ink mb-4">Start Your Journey</h2>
                <p className="text-ink-light text-lg leading-relaxed">
                  Create an account to start streaming, chatting, and discovering amazing content.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-ink-blue mb-1">Free</div>
                    <div className="text-xs text-ink-light">Forever</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-ink-purple mb-1">HD</div>
                    <div className="text-xs text-ink-light">Streaming</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-gradient-to-br from-ink-blue to-ink-purple rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-ink">Nebula</span>
            </Link>
            <h1 className="text-4xl font-bold text-ink mb-2">Create Account</h1>
            <p className="text-ink-light text-lg">Join the community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none"
                    placeholder="johndoe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    name="isStreamer"
                    type="checkbox"
                    checked={formData.isStreamer}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-ink-blue focus:ring-ink-blue"
                  />
                </div>
                <div>
                  <span className="font-bold text-ink block">I want to stream</span>
                  <span className="text-xs text-ink-light">Enable streaming features for your account</span>
                </div>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ink-black text-white rounded-xl font-bold shadow-lg shadow-ink-black/20 hover:shadow-xl hover:shadow-ink-black/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-ink">
                <Github className="w-5 h-5" /> Github
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-ink">
                <span className="text-xl">G</span> Google
              </button>
            </div>
          </form>

          <p className="text-center text-ink-light">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-ink-blue hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
