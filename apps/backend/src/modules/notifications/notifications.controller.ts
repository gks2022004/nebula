import { Controller, Get, Put, Param, UseGuards, Req } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req) {
    return this.notificationsService.getNotifications(req.user.id)
  }

  @Put(':notificationId/read')
  async markAsRead(@Req() req, @Param('notificationId') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId, req.user.id)
  }

  @Put('read-all')
  async markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.id)
  }
}
