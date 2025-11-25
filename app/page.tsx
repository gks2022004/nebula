'use client'

import { StreamGrid } from "@/components/streams/stream-grid";
import { Hero } from "@/components/home/hero";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-[40%] left-[10%] w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[20%] right-[30%] w-72 h-72 bg-pink-200/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>
      
      <div className="relative z-10">
        <Hero />
        
        <section className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-center justify-between"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-2">
                Live Now
              </h2>
              <p className="text-ink-light text-lg">Catch the best moments as they happen</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-8" />
          </motion.div>
          
          <StreamGrid liveOnly={true} limit={8} />
        </section>

        <section className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-center justify-between"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-2">
                Discover More
              </h2>
              <p className="text-ink-light text-lg">Explore all active streams across categories</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-8" />
          </motion.div>
          
          <StreamGrid limit={20} />
        </section>
      </div>
    </main>
  );
}
