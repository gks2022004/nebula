import { prisma } from './prisma'

export async function getStreamByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      streams: {
        take: 1,
        orderBy: { createdAt: 'desc' },
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
      }
    }
  })

  if (!user || user.streams.length === 0) {
    return null
  }

  return user.streams[0]
}

export async function getStreamById(id: string) {
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
