import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { StreamsService } from './streams.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('streams')
export class StreamsController {
  constructor(private streamsService: StreamsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createStream(@Req() req, @Body() body: { title: string; description?: string }) {
    return this.streamsService.createStream(req.user.id, body.title, body.description)
  }

  @Get('live')
  async getLiveStreams(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.streamsService.getLiveStreams(limit, offset)
  }

  @Get(':streamId')
  async getStream(@Param('streamId') streamId: string) {
    return this.streamsService.getStream(streamId)
  }

  @Put(':streamId/end')
  @UseGuards(JwtAuthGuard)
  async endStream(@Req() req, @Param('streamId') streamId: string) {
    return this.streamsService.endStream(streamId, req.user.id)
  }

  @Get('user/:userId')
  async getStreamsByUser(@Param('userId') userId: string) {
    return this.streamsService.getStreamsByUser(userId)
  }
}
