import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { randomBytes } from 'crypto'

@Injectable()
export class StreamsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  async createStream(userId: string, title: string, description?: string) {
    // Generate unique stream key
    const streamKey = randomBytes(32).toString('hex')

    const stream = await this.prisma.stream.create({
      data: {
        title,
        description,
        streamerId: userId,
        streamKey,
        status: 'LIVE',
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    // Cache active stream
    await this.redis.set(`stream:${stream.id}`, JSON.stringify(stream), 3600)

    // Publish stream started event
    await this.redis.publish(
      'stream:started',
      JSON.stringify({ streamId: stream.id, streamerId: userId })
    )

    return stream
  }

  async getStream(streamId: string) {
    // Try cache first
    const cached = await this.redis.get(`stream:${streamId}`)
    if (cached) {
      return JSON.parse(cached)
    }

    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    if (!stream) {
      throw new NotFoundException('Stream not found')
    }

    return stream
  }

  async getLiveStreams(limit = 20, offset = 0) {
    return this.prisma.stream.findMany({
      where: { status: 'LIVE' },
      take: limit,
      skip: offset,
      orderBy: { viewerCount: 'desc' },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })
  }

  async endStream(streamId: string, userId: string) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
    })

    if (!stream) {
      throw new NotFoundException('Stream not found')
    }

    if (stream.streamerId !== userId) {
      throw new ForbiddenException('Not authorized to end this stream')
    }

    const updatedStream = await this.prisma.stream.update({
      where: { id: streamId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    })

    // Remove from cache
    await this.redis.del(`stream:${streamId}`)

    // Publish stream ended event
    await this.redis.publish('stream:ended', JSON.stringify({ streamId, streamerId: userId }))

    return updatedStream
  }

  async updateViewerCount(streamId: string, count: number) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
    })

    if (!stream) {
      return
    }

    await this.prisma.stream.update({
      where: { id: streamId },
      data: {
        viewerCount: count,
        peakViewers: count > stream.peakViewers ? count : stream.peakViewers,
      },
    })
  }

  async getStreamsByUser(userId: string) {
    return this.prisma.stream.findMany({
      where: { streamerId: userId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    })
  }
}
