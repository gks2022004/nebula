import { prisma } from './prisma'

export async function getStreamByUsername(username: string, currentUserId?: string) {
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

  const stream = user.streams[0]

  // Check if current user is following the streamer
  let isFollowing = false
  if (currentUserId && currentUserId !== stream.streamerId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: stream.streamerId
        }
      }
    })
    isFollowing = !!follow
  }

  return { ...stream, isFollowing }
}

export async function getStreamById(id: string, currentUserId?: string) {
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

  if (!stream) {
    return null
  }

  // Check if current user is following the streamer
  let isFollowing = false
  if (currentUserId && currentUserId !== stream.streamerId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: stream.streamerId
        }
      }
    })
    isFollowing = !!follow
  }

  return { ...stream, isFollowing }
}
