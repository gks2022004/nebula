import { notFound } from 'next/navigation'
import { StreamPage } from '@/components/streams/stream-page'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: {
    id: string
  }
}

async function getStream(id: string) {
  const stream = await prisma.stream.findUnique({
    where: { id },
    include: {
      streamer: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          isStreamer: true
        }
      }
    }
  })

  return stream
}

export default async function Stream({ params }: PageProps) {
  const stream = await getStream(params.id)

  if (!stream) {
    notFound()
  }

  return <StreamPage stream={stream} />
}
