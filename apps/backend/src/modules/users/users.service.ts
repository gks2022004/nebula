import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            streams: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async updateProfile(
    userId: string,
    data: { displayName?: string; bio?: string; avatar?: string }
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
      },
    })
  }

  async followUser(followerId: string, followingId: string) {
    return this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    })
  }

  async unfollowUser(followerId: string, followingId: string) {
    return this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    })
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
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

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
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
}
