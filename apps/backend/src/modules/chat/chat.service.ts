import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  async saveMessage(streamId: string, userId: string, message: string) {
    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        streamId,
        userId,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    // Publish to Redis for real-time distribution
    await this.redis.publish(`chat:${streamId}`, JSON.stringify(chatMessage))

    return chatMessage
  }

  async getMessages(streamId: string, limit = 50) {
    return this.prisma.chatMessage.findMany({
      where: {
        streamId,
        isDeleted: false,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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

  async deleteMessage(messageId: string, userId: string) {
    // Verify the user owns the message or is a moderator
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return
    }

    await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    // Publish deletion event
    await this.redis.publish(
      `chat:${message.streamId}`,
      JSON.stringify({
        type: 'delete',
        messageId,
      })
    )
  }
}
