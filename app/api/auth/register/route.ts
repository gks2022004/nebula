import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateStreamKey } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, name, isStreamer } = await req.json()

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || username,
        isStreamer: isStreamer || false
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isStreamer: true,
        createdAt: true
      }
    })

    // If user is a streamer, create a default stream
    if (isStreamer) {
      await prisma.stream.create({
        data: {
          title: `${username}'s Stream`,
          streamKey: generateStreamKey(),
          streamerId: user.id
        }
      })
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
