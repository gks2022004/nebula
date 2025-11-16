import { StreamGrid } from '@/components/streams/stream-grid'
import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Radio } from 'lucide-react'

export default async function BrowsePage() {
  const session = await auth()
  const isStreamer = session?.user?.isStreamer

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">
          Browse Live Streams
        </h1>
        <p className="text-gray-300 text-lg">
          Discover amazing streamers and join the community
        </p>
        {isStreamer && (
          <div className="flex justify-center">
            <Button asChild className="gradient-primary">
              <Link href="/dashboard">
                <Radio className="mr-2 h-4 w-4" />
                Go to Dashboard to Start Streaming
              </Link>
            </Button>
          </div>
        )}
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
