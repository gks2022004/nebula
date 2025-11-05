import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req) {
    return this.usersService.getProfile(req.user.id)
  }

  @Get(':userId')
  async getUserProfile(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId)
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.id, data)
  }

  @Post(':userId/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(@Req() req, @Param('userId') userId: string) {
    return this.usersService.followUser(req.user.id, userId)
  }

  @Delete(':userId/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Req() req, @Param('userId') userId: string) {
    return this.usersService.unfollowUser(req.user.id, userId)
  }

  @Get(':userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    return this.usersService.getFollowers(userId)
  }

  @Get(':userId/following')
  async getFollowing(@Param('userId') userId: string) {
    return this.usersService.getFollowing(userId)
  }
}
