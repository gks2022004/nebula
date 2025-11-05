import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            🌌 Nebula
          </h1>
          <p className="text-xl text-gray-300">
            Modern Real-Time Live Streaming Platform
          </p>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-lg text-gray-400 mb-8">
            Experience ultra-low-latency live streaming with WebRTC technology.
            Broadcast, watch, and interact in real-time.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
            <Link
              href="/streams"
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
            >
              Browse Streams
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Live Streaming
            </h3>
            <p className="text-gray-400">
              Broadcast live video with WebRTC technology for ultra-low latency
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Real-Time Chat
            </h3>
            <p className="text-gray-400">
              Engage with viewers through instant messaging and reactions
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Community
            </h3>
            <p className="text-gray-400">
              Follow streamers, get notifications, and build your audience
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Built with Modern Technology
          </h2>
          <div className="flex flex-wrap gap-4 justify-center text-gray-400">
            <span className="px-4 py-2 bg-gray-800 rounded">Next.js</span>
            <span className="px-4 py-2 bg-gray-800 rounded">Nest.js</span>
            <span className="px-4 py-2 bg-gray-800 rounded">Go</span>
            <span className="px-4 py-2 bg-gray-800 rounded">WebRTC</span>
            <span className="px-4 py-2 bg-gray-800 rounded">PostgreSQL</span>
            <span className="px-4 py-2 bg-gray-800 rounded">Redis</span>
            <span className="px-4 py-2 bg-gray-800 rounded">AWS</span>
          </div>
        </div>
      </div>
    </main>
  )
}
