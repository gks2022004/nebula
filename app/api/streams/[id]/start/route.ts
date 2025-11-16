import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stream = await prisma.stream.findUnique({
      where: { id }
    })

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    if (stream.streamerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const updatedStream = await prisma.stream.update({
      where: { id },
      data: {
        isLive: true,
        startedAt: new Date(),
        endedAt: null
      }
    })

    // Notify followers
    const followers = await prisma.follow.findMany({
      where: { followingId: session.user.id },
      select: { followerId: true }
    })

    await prisma.notification.createMany({
      data: followers.map((f: { followerId: string }) => ({
        userId: f.followerId,
        type: 'stream_live',
        title: 'Stream is Live!',
        message: `${session.user?.name || 'A streamer'} just went live: ${stream.title}`,
        link: `/stream/${stream.id}`
      }))
    })

    return NextResponse.json(updatedStream)
  } catch (error) {
    console.error('Error starting stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
