import { StreamGrid } from '@/components/streams/stream-grid'

export default function BrowsePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">
          Browse Live Streams
        </h1>
        <p className="text-gray-300 text-lg">
          Discover amazing streamers and join the community
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-white">Live Now</h2>
        <StreamGrid liveOnly={true} limit={50} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-white">Recent Streams</h2>
        <StreamGrid limit={50} />
      </section>
    </div>
  )
}
