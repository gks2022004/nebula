import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const liveOnly = searchParams.get('liveOnly') === 'true'

    const where: any = {}
    
    if (liveOnly) {
      where.isLive = true
    }
    
    if (category) {
      where.category = category
    }

    const streams = await prisma.stream.findMany({
      where,
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            isStreamer: true
          }
        }
      },
      orderBy: [
        { isLive: 'desc' },
        { viewerCount: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.stream.count({ where })

    return NextResponse.json({
      streams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description, category, tags } = await req.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const stream = await prisma.stream.create({
      data: {
        title,
        description,
        category,
        tags: tags || [],
        streamKey: `sk_${Math.random().toString(36).substring(2, 15)}`,
        streamerId: session.user.id
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

    return NextResponse.json(stream, { status: 201 })
  } catch (error) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
