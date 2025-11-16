'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Video, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Radio
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b-4 border-white bg-black sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-pink-500 border-4 border-white flex items-center justify-center shadow-[4px_4px_0px_#ffff00]">
                <Video className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <span className="text-3xl font-black text-glow-cyan uppercase tracking-tighter">NEBULA</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/browse" 
                className="text-white hover:text-cyan-400 transition-colors font-black uppercase tracking-wide text-sm"
              >
                BROWSE
              </Link>
              {session?.user.isStreamer && (
                <Link 
                  href="/dashboard" 
                  className="text-white hover:text-pink-500 transition-colors flex items-center space-x-1 font-black uppercase tracking-wide text-sm"
                >
                  <Radio className="w-4 h-4" strokeWidth={3} />
                  <span>DASHBOARD</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-12 h-12 border-4 border-white bg-gray-700 animate-pulse" />
            ) : session ? (
              <>
                <button className="w-12 h-12 border-4 border-white bg-yellow-400 hover:bg-yellow-300 transition-all hover:shadow-[4px_4px_0px_#000] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-black" strokeWidth={3} />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-12 h-12 border-4 border-white bg-pink-500 hover:bg-pink-400 transition-all hover:shadow-[4px_4px_0px_#000] flex items-center justify-center font-black text-xl text-black">
                      {session.user.name?.[0] || 'U'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 neo-card p-2">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${session.user.username}`} className="cursor-pointer font-bold uppercase">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer font-bold uppercase">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="cursor-pointer text-red-400 font-bold uppercase"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <button className="neo-button px-6 py-3 text-sm">
                    LOGIN
                  </button>
                </Link>
                <Link href="/register">
                  <button className="neo-button neo-button-pink px-6 py-3 text-sm">
                    SIGN UP
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
