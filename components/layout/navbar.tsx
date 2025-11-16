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
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">Nebula</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/browse" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Browse
              </Link>
              {session?.user.isStreamer && (
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <Radio className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            ) : session ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white"
                >
                  <Bell className="w-5 h-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                      <Avatar>
                        <AvatarImage src={session.user.image || ''} />
                        <AvatarFallback className="gradient-primary text-white">
                          {session.user.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-dark">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${session.user.username}`} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="cursor-pointer text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="gradient-primary">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
