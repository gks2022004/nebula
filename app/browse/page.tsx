'use client'

import { StreamGrid } from '@/components/streams/stream-grid'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Radio, Sparkles } from 'lucide-react'
import { useEffect } from 'react'

export default function BrowsePage() {
  const { data: session } = useSession()
  const isStreamer = session?.user?.isStreamer

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-fade-in').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 neo-grid pointer-events-none" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-6xl md:text-8xl font-black text-glow-cyan uppercase tracking-tighter">
            BROWSE
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-1 w-20 bg-cyan-400" />
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" fill="#ffff00" />
            <div className="h-1 w-20 bg-pink-500" />
          </div>
          <p className="text-xl text-gray-300 font-bold uppercase tracking-wide">
            DISCOVER AMAZING STREAMERS
          </p>
          
          {isStreamer && (
            <div className="flex justify-center">
              <Link href="/dashboard">
                <button className="neo-button neo-button-pink px-8 py-4 text-lg flex items-center gap-3">
                  <Radio className="w-5 h-5" strokeWidth={3} />
                  GO LIVE NOW
                </button>
              </Link>
            </div>
          )}
        </div>

        <section className="mb-20">
          <div className="scroll-fade-in mb-12">
            <h2 className="text-5xl md:text-7xl font-black text-glow-pink uppercase tracking-tight mb-4">
              LIVE NOW
            </h2>
            <div className="h-2 w-32 bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400" />
          </div>
          <div className="scroll-fade-in">
            <StreamGrid liveOnly={true} limit={50} />
          </div>
        </section>

        <section>
          <div className="scroll-fade-in mb-12">
            <h2 className="text-5xl md:text-7xl font-black text-glow-cyan uppercase tracking-tight mb-4">
              ALL STREAMS
            </h2>
            <div className="h-2 w-32 bg-gradient-to-r from-cyan-400 via-lime-400 to-pink-500" />
          </div>
          <div className="scroll-fade-in">
            <StreamGrid limit={50} />
          </div>
        </section>
      </div>
    </main>
  )
}
