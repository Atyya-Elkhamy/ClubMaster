import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './notifications.schema';
import { Model, isValidObjectId } from 'mongoose';
import { CreateNotificationDto } from '../common/dto/notifications.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>,
    ) { }

    async create(dto: CreateNotificationDto): Promise<{ message: string; notification: Notification }> {
        if (!dto.user || !isValidObjectId(dto.user)) {
            throw new BadRequestException('Invalid or missing user ID.');
        }
        const notification = await this.notificationModel.create(dto);
        return { message: 'Notification created successfully', notification };
    }

    async findByUser(userId: string): Promise<{ message: string; notifications: Notification[] }> {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException('Invalid user ID.');
        }
        const notifications = await this.notificationModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .exec();
        if (!notifications.length) {
            throw new NotFoundException('No notifications found for this user.');
        }
        return { message: 'Notifications retrieved successfully', notifications };
    }

    async markAsRead(notificationId: string, userId: string): Promise<{ message: string; notification: Notification }> {
        if (!isValidObjectId(notificationId)) {
            throw new BadRequestException('Invalid notification ID.');
        }
        const notification = await this.notificationModel.findById(notificationId).exec();
        if (!notification) {
            throw new NotFoundException('Notification not found.');
        }
        if (notification.user.toString() !== userId) {
            throw new ForbiddenException('You are not allowed to modify this notification.');
        }
        notification.isRead = true;
        await notification.save();
        return { message: 'Notification marked as read', notification };
    }

    async deleteOne(notificationId: string, userId: string): Promise<{ message: string; deletedNotification: Notification }> {
        if (!isValidObjectId(notificationId)) {
            throw new BadRequestException('Invalid notification ID.');
        }
        const notification = await this.notificationModel.findById(notificationId).exec();
        if (!notification) {
            throw new NotFoundException('Notification not found.');
        }
        if (notification.user.toString() !== userId) {
            throw new ForbiddenException('You are not allowed to delete this notification.');
        }
        await notification.deleteOne();
        return { message: 'Notification deleted successfully', deletedNotification: notification };
    }

    async deleteAllForUser(userId: string): Promise<{ message: string; deletedCount: number }> {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException('Invalid user ID.');
        }
        const result = await this.notificationModel.deleteMany({ user: userId });
        return { message: 'Notifications deleted successfully', deletedCount: result.deletedCount || 0 };
    }

    async notifyMembershipExpired(userId: string, membershipId: string): Promise<{ message: string; notification: Notification }> {
        const message = `Your membership (ID: ${membershipId}) has expired. Please renew to continue enjoying the service.`;
        return this.create({
            user: userId,
            message,
        });
    }
}
