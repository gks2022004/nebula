'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Bell, Video, Shield, Trash2, Save, Check, Camera, Mail, Lock, Globe, Moon, Sun } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

function SettingsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const initialTab = searchParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Profile settings
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [liveAlerts, setLiveAlerts] = useState(true)
  const [chatNotifications, setChatNotifications] = useState(true)
  const [followerAlerts, setFollowerAlerts] = useState(true)
  
  // Stream settings
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [streamCategory, setStreamCategory] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user) {
      setName(session.user.name || '')
    }
  }, [session, status, router])

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast({
        title: '✅ Settings Saved',
        description: 'Your changes have been updated successfully!'
      })
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ink-blue/20 border-t-ink-blue rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your public profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Customize your alerts' },
    { id: 'stream', label: 'Stream', icon: Video, description: 'Configure stream settings' },
    { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Security and data' },
  ]

  return (
    <div className="min-h-screen bg-[#faf6eb] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ink mb-2">Settings</h1>
          <p className="text-ink-light text-lg">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-ink-black/5 overflow-hidden sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all border-l-4 ${
                    activeTab === tab.id
                      ? 'bg-ink-blue/5 border-ink-blue text-ink-blue'
                      : 'border-transparent text-ink hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-ink-blue' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-bold">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-ink-black/5 p-8"
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-ink">Public Profile</h2>
                        <p className="text-ink-light">This is how others will see you on Nebula</p>
                      </div>
                      <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#1a1a2e] text-white rounded-xl font-bold shadow-lg shadow-[#1a1a2e]/20 hover:shadow-xl hover:shadow-[#1a1a2e]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : saved ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saved ? 'Saved' : 'Save Changes'}
                      </button>
                    </div>

                    <div className="flex items-start gap-8">
                      <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                          {session?.user?.image ? (
                            <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-ink mb-2">Display Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-ink mb-2">Username</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                              <input
                                type="text"
                                value={session?.user?.username || ''}
                                disabled
                                className="w-full pl-8 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-ink mb-2">Bio</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none min-h-[120px] resize-none"
                            placeholder="Tell the world about yourself..."
                          />
                          <p className="text-xs text-gray-400 mt-2 text-right">0/160 characters</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-ink">Notifications</h2>
                        <p className="text-ink-light">Choose what you want to be notified about</p>
                      </div>
                      <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#1a1a2e] text-white rounded-xl font-bold shadow-lg shadow-[#1a1a2e]/20 hover:shadow-xl hover:shadow-[#1a1a2e]/30 transition-all flex items-center gap-2"
                      >
                        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved' : 'Save Preferences'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Email Notifications', desc: 'Receive updates via email', state: emailNotifications, set: setEmailNotifications, icon: Mail },
                        { label: 'Live Alerts', desc: 'Get notified when followed streamers go live', state: liveAlerts, set: setLiveAlerts, icon: Video },
                        { label: 'Chat Mentions', desc: 'Notifications when someone mentions you', state: chatNotifications, set: setChatNotifications, icon: Bell },
                        { label: 'New Followers', desc: 'Get notified when someone follows you', state: followerAlerts, set: setFollowerAlerts, icon: User },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-ink-blue">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-ink">{item.label}</h3>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={item.state}
                              onChange={(e) => item.set(e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ink-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ink-blue"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stream Tab */}
                {activeTab === 'stream' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-ink">Stream Settings</h2>
                        <p className="text-ink-light">Configure your stream details and keys</p>
                      </div>
                      {session?.user?.isStreamer && (
                        <button 
                          onClick={handleSave}
                          disabled={loading}
                          className="px-6 py-2.5 bg-[#1a1a2e] text-white rounded-xl font-bold shadow-lg shadow-[#1a1a2e]/20 hover:shadow-xl hover:shadow-[#1a1a2e]/30 transition-all flex items-center gap-2"
                        >
                          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                          {saved ? 'Saved' : 'Save Settings'}
                        </button>
                      )}
                    </div>

                    {session?.user?.isStreamer ? (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-ink mb-2">Default Stream Title</label>
                          <input
                            type="text"
                            value={streamTitle}
                            onChange={(e) => setStreamTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none"
                            placeholder="My awesome stream!"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-ink mb-2">Stream Description</label>
                          <textarea
                            value={streamDescription}
                            onChange={(e) => setStreamDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none min-h-[100px] resize-none"
                            placeholder="What's your stream about?"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-ink mb-2">Category</label>
                          <select
                            value={streamCategory}
                            onChange={(e) => setStreamCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ink-blue/20 focus:border-ink-blue transition-all outline-none"
                          >
                            <option value="">Select a category...</option>
                            <option value="gaming">🎮 Gaming</option>
                            <option value="music">🎵 Music</option>
                            <option value="art">🎨 Art & Creative</option>
                            <option value="coding">💻 Coding</option>
                            <option value="chatting">💬 Just Chatting</option>
                          </select>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                          <h3 className="font-bold text-yellow-800 mb-1">Stream Key</h3>
                          <p className="text-sm text-yellow-600 mb-3">Keep this key secret! Anyone with this key can stream to your channel.</p>
                          <div className="flex gap-2">
                            <input 
                              type="password" 
                              value="live_sk_123456789" 
                              readOnly 
                              className="flex-1 px-3 py-2 bg-white border border-yellow-200 rounded-lg text-sm font-mono"
                            />
                            <button className="px-4 py-2 bg-[#4361ee] text-white rounded-lg text-sm font-bold hover:bg-[#4361ee]/90 transition-colors shadow-lg shadow-[#4361ee]/20">
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 text-ink-purple">
                          <Video className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-ink mb-2">Become a Streamer</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Start your streaming journey today! Share your passion with the world and build your community.</p>
                        <button className="px-8 py-3 bg-[#9b5de5] text-white rounded-xl font-bold shadow-lg shadow-[#9b5de5]/20 hover:shadow-xl hover:shadow-[#9b5de5]/30 transition-all">
                          Apply Now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-ink">Privacy & Security</h2>
                        <p className="text-ink-light">Manage your security preferences</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-6 bg-white border border-gray-200 rounded-xl hover:border-ink-blue/30 transition-colors group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-ink group-hover:text-ink-blue transition-colors">Change Password</h3>
                              <p className="text-sm text-gray-500">Update your account password</p>
                            </div>
                          </div>
                          <div className="text-gray-400 group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                      </div>

                      <div className="p-6 bg-white border border-gray-200 rounded-xl hover:border-ink-blue/30 transition-colors group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-ink group-hover:text-ink-blue transition-colors">Active Sessions</h3>
                              <p className="text-sm text-gray-500">Manage devices logged into your account</p>
                            </div>
                          </div>
                          <div className="text-gray-400 group-hover:translate-x-1 transition-transform">→</div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-red-600 font-bold mb-4">Danger Zone</h3>
                        <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-red-900">Delete Account</h4>
                            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                          </div>
                          <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ink-blue/20 border-t-ink-blue rounded-full animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
