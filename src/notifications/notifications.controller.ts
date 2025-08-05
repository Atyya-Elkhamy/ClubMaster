import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from '../common/dto/notifications.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { AuthenticatedRequest } from '../common/interfaces/users.interface';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(
    @Body() dto: CreateNotificationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    console.log("the user is ",req.user.id)
    return this.notificationService.create({
      ...dto,
      user: req.user.id,
    });
  }

  @Get()
  async getUserNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationService.findByUser(req.user.id);
  }

  @Patch('read/:notificationId')
  async markAsRead(@Param('notificationId') id: string) {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }

  @Delete(':notificationId')
  async deleteOne(@Param('notificationId') id: string) {
    await this.notificationService.deleteOne(id);
    return { success: true, message: 'Notification deleted' };
  }

  @Delete()
  async deleteAllForUser(@Req() req: AuthenticatedRequest) {
    await this.notificationService.deleteAllForUser(req.user.id);
    return { success: true, message: 'All notifications deleted for user' };
  }
}
