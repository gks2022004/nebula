import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await prisma.stream.findUnique({
      where: { id: params.id },
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
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(stream)
  } catch (error) {
    console.error('Error fetching stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stream = await prisma.stream.findUnique({
      where: { id: params.id }
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

    const data = await req.json()
    
    const updatedStream = await prisma.stream.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(updatedStream)
  } catch (error) {
    console.error('Error updating stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stream = await prisma.stream.findUnique({
      where: { id: params.id }
    })

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    const isOwner = stream.streamerId === session.user.id
    const isAdmin = (session.user as any).isAdmin === true
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.stream.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
