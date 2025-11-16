'use client'

import { StreamGrid } from "@/components/streams/stream-grid";
import { Hero } from "@/components/home/hero";
import { FeaturedStreamers } from "@/components/home/featured-streamers";
import { useEffect } from 'react';

export default function Home() {
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
      {/* Grid background */}
      <div className="fixed inset-0 neo-grid pointer-events-none" />
      
      <div className="relative z-10">
        <Hero />
        
        <section className="container mx-auto px-4 py-20">
          <div className="scroll-fade-in mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-4 text-glow-pink uppercase tracking-tight">
              LIVE NOW
            </h2>
            <div className="h-2 w-32 bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400" />
          </div>
          
          <div className="scroll-fade-in">
            <StreamGrid liveOnly={true} limit={20} />
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="scroll-fade-in mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-4 text-glow-cyan uppercase tracking-tight">
              TOP STREAMERS
            </h2>
            <div className="h-2 w-32 bg-gradient-to-r from-lime-400 via-cyan-400 to-pink-500" />
          </div>
          
          <div className="scroll-fade-in">
            <FeaturedStreamers />
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="scroll-fade-in mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-4 text-glow-yellow uppercase tracking-tight">
              ALL STREAMS
            </h2>
            <div className="h-2 w-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500" />
          </div>
          
          <div className="scroll-fade-in">
            <StreamGrid limit={20} />
          </div>
        </section>

        {/* Floating elements */}
        <div className="fixed top-20 right-10 w-20 h-20 bg-cyan-400 neo-border animate-float opacity-20 hidden lg:block" />
        <div className="fixed bottom-40 left-10 w-16 h-16 bg-pink-500 neo-border animate-float opacity-20 hidden lg:block" style={{animationDelay: '1s'}} />
        <div className="fixed top-1/2 right-1/4 w-12 h-12 bg-yellow-400 neo-border animate-float opacity-20 hidden lg:block" style={{animationDelay: '2s'}} />
      </div>
    </main>
  );
}
