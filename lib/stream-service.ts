import { prisma } from './prisma'

export async function getStreamByUsername(usernameOrId: string, currentUserId?: string) {
  // First try to find by username
  let user = await prisma.user.findUnique({
    where: { username: usernameOrId },
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

  // If not found by username, try to find by user ID
  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: usernameOrId },
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
  }

  // If still not found, try to find by stream ID directly
  if (!user) {
    const stream = await getStreamById(usernameOrId, currentUserId)
    return stream
  }

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
