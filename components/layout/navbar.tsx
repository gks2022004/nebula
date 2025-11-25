'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Radio,
  Pencil,
  X,
  Check,
  Trash2,
  Menu,
  Search,
  Sparkles
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  type: 'live' | 'follow' | 'chat' | 'system'
  message: string
  time: string
  read: boolean
  link?: string
}

export function Navbar() {
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'live', message: '🔴 StreamerJoe is now live!', time: '2m ago', read: false, link: '/stream/streamerjoe' },
    { id: '2', type: 'follow', message: '👥 CoolUser123 started following you', time: '1h ago', read: false },
    { id: '3', type: 'system', message: '✨ Welcome to Nebula! Start exploring', time: '1d ago', read: true },
  ])

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [window.location.pathname])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-ink-black/10 shadow-sm py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group relative">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-[#4361ee] to-[#9b5de5] rounded-xl flex items-center justify-center shadow-lg"
              >
                <Video className="w-5 h-5 text-white" strokeWidth={2.5} />
              </motion.div>
              <span className="text-2xl font-bold text-ink tracking-tight group-hover:text-[#4361ee] transition-colors duration-300">
                Nebula
              </span>
              <motion.div 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4361ee] to-[#9b5de5] group-hover:w-full transition-all duration-300"
              />
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {[
                { href: '/browse', label: 'Browse', icon: Search },
                ...(session?.user.isStreamer ? [{ href: '/dashboard', label: 'Dashboard', icon: Radio }] : [])
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2 font-medium text-ink-light group-hover:text-ink transition-colors">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-ink-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    layoutId="navbar-hover"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-ink hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {status === 'loading' ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <>
                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-white border border-ink-black/10 hover:border-ink-blue/50 hover:shadow-md transition-all flex items-center justify-center relative group"
                    >
                      <Bell className="w-5 h-5 text-ink-light group-hover:text-ink-blue transition-colors" />
                      {unreadCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-[#e63946] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-ink-black/10 shadow-xl rounded-xl bg-white/90 backdrop-blur-xl">
                    <div className="p-4 border-b border-ink-black/5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                      <span className="font-bold text-ink flex items-center gap-2">
                        <Bell className="w-4 h-4 text-ink-blue" />
                        Notifications
                      </span>
                      {notifications.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-ink-blue hover:text-ink-blue/80 font-medium transition-colors"
                          >
                            Mark all read
                          </button>
                          <button 
                            onClick={clearAll}
                            className="text-xs text-ink-red hover:text-ink-red/80 font-medium transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {notifications.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Bell className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-ink font-medium">All caught up!</p>
                            <p className="text-xs text-ink-light mt-1">No new notifications</p>
                          </motion.div>
                        ) : (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={`p-4 border-b border-ink-black/5 hover:bg-gray-50 transition-colors relative group cursor-pointer ${
                                !notification.read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                  !notification.read ? 'bg-[#4361ee]' : 'bg-transparent'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    href={notification.link || '#'}
                                    onClick={() => markAsRead(notification.id)}
                                    className="block"
                                  >
                                    <p className={`text-sm truncate ${!notification.read ? 'font-semibold text-ink' : 'text-ink-light'}`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                  </Link>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    clearNotification(notification.id)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-ink-red"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <Link 
                      href="/settings" 
                      className="block p-3 text-center text-xs font-medium text-ink-light hover:text-ink-blue hover:bg-gray-50 border-t border-ink-black/5 transition-colors"
                    >
                      View Notification Settings
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-ink-black/10 hover:border-ink-purple/50 hover:shadow-md transition-all bg-white group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-purple to-ink-pink flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {session.user.name?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-medium text-ink group-hover:text-ink-purple transition-colors max-w-[100px] truncate hidden md:block">
                        {session.user.name}
                      </span>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 p-2 border-ink-black/10 shadow-xl rounded-xl bg-white/90 backdrop-blur-xl">
                    <div className="px-3 py-3 mb-2 bg-gray-50 rounded-lg">
                      <p className="font-bold text-ink text-sm">{session.user.name}</p>
                      <p className="text-xs text-ink-light">@{session.user.username}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-ink-blue/10 hover:text-ink-blue transition-colors text-sm font-medium text-ink-light">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    
                    <DropdownMenuSeparator className="my-2 bg-ink-black/5" />
                    
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-ink-red/10 hover:text-ink-red transition-colors text-sm font-medium text-ink-red"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-ink font-medium hover:text-[#4361ee] transition-colors"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-[#1a1a2e] text-white rounded-lg font-medium shadow-lg shadow-[#1a1a2e]/20 hover:shadow-xl hover:shadow-[#1a1a2e]/30 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-ink-black/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link 
                href="/browse" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-ink font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-5 h-5" />
                Browse
              </Link>
              {session?.user.isStreamer && (
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-ink font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Radio className="w-5 h-5" />
                  Dashboard
                </Link>
              )}
              {!session && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <button className="w-full py-3 text-ink font-bold border-2 border-ink-black rounded-lg hover:bg-gray-50">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <button className="w-full py-3 bg-ink-black text-white font-bold rounded-lg hover:bg-ink-black/90">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

