import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { CreateNotificationDto } from '../common/dto/notifications.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { AuthenticatedRequest } from '../common/interfaces/users.interface';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  async create(
    @Body() dto: Omit<CreateNotificationDto, 'user'>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notificationService.create({
      ...dto,
      user: req.user.id,
    });
  }

  @Get()
  async getUserNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationService.findByUser(req.user.id);
  }

  @Put('read/:notificationId')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notificationService.markAsRead(notificationId, req.user.id);
  }

  @Delete(':notificationId')
  async deleteOne(
    @Param('notificationId') notificationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notificationService.deleteOne(notificationId, req.user.id);
  }

  @Delete()
  async deleteAllForUser(@Req() req: AuthenticatedRequest) {
    return this.notificationService.deleteAllForUser(req.user.id);
  }
}
