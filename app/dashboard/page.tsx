import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { Stream, User } from '@/types'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.isStreamer) {
    redirect('/')
  }

  const stream = await prisma.stream.findFirst({
    where: { streamerId: session.user.id },
    include: {
      streamer: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          isStreamer: true,
          email: true,
          isModerator: true,
          isAdmin: true,
          createdAt: true
        }
      }
    }
  })

  if (!stream) {
    redirect('/')
  }

  const transformedStream: Stream & { streamer: User } = {
    id: stream.id,
    title: stream.title,
    description: stream.description ?? undefined,
    thumbnailUrl: stream.thumbnailUrl ?? undefined,
    streamKey: stream.streamKey,
    isLive: stream.isLive,
    viewerCount: stream.viewerCount,
    peakViewers: stream.peakViewers,
    category: stream.category ?? undefined,
    tags: stream.tags,
    streamerId: stream.streamerId,
    startedAt: stream.startedAt ?? undefined,
    endedAt: stream.endedAt ?? undefined,
    createdAt: stream.createdAt,
    streamer: {
      id: stream.streamer.id,
      username: stream.streamer.username,
      email: stream.streamer.email,
      name: stream.streamer.name ?? undefined,
      avatar: stream.streamer.avatar ?? undefined,
      bio: stream.streamer.bio ?? undefined,
      isStreamer: stream.streamer.isStreamer,
      isModerator: stream.streamer.isModerator,
      isAdmin: stream.streamer.isAdmin,
      createdAt: stream.streamer.createdAt
    }
  }

  return (
    <div className="min-h-screen bg-paper-bg py-8 px-4">
      <DashboardContent 
        stream={transformedStream} 
        user={{
          id: session.user.id,
          username: session.user.username,
          email: session.user.email || '',
          name: session.user.name ?? undefined,
          avatar: session.user.image ?? undefined,
          bio: undefined,
          isStreamer: session.user.isStreamer,
          isModerator: session.user.isModerator,
          isAdmin: session.user.isAdmin,
          createdAt: new Date()
        }} 
      />
    </div>
  )
}
