import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue
  ) {}

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: any
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
      },
    })

    // Queue notification for processing (email, push, etc.)
    await this.notificationQueue.add('send', {
      notificationId: notification.id,
      userId,
      type,
      title,
      message,
    })

    return notification
  }

  async getNotifications(userId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  }

  async notifyFollowers(streamerId: string, streamId: string, streamTitle: string) {
    // Get all followers
    const follows = await this.prisma.follow.findMany({
      where: { followingId: streamerId },
      select: { followerId: true },
    })

    // Create notifications for all followers
    const notifications = follows.map((follow) =>
      this.createNotification(
        follow.followerId,
        'stream_live',
        'Stream is live!',
        `${streamTitle} is now streaming`,
        { streamId, streamerId }
      )
    )

    await Promise.all(notifications)
  }
}
