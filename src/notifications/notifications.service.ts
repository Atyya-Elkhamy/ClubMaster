import {
    Injectable,
    NotFoundException,
    BadRequestException,
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

    async create(dto: CreateNotificationDto): Promise<Notification> {
        // Validate user field if exists
        if (!dto.user || !isValidObjectId(dto.user)) {
            throw new BadRequestException('Invalid or missing user ID.');
        }

        return await this.notificationModel.create(dto);
    }

    async findByUser(userId: string): Promise<Notification[]> {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException('Invalid user ID.');
        }

        return this.notificationModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .exec();
    }

    async markAsRead(notificationId: string): Promise<void> {
        if (!isValidObjectId(notificationId)) {
            throw new BadRequestException('Invalid notification ID.');
        }

        const updated = await this.notificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true },
        );

        if (!updated) {
            throw new NotFoundException('Notification not found.');
        }
    }

    async deleteOne(notificationId: string): Promise<void> {
        if (!isValidObjectId(notificationId)) {
            throw new BadRequestException('Invalid notification ID.');
        }

        const deleted = await this.notificationModel.findByIdAndDelete(
            notificationId,
        );

        if (!deleted) {
            throw new NotFoundException('Notification not found.');
        }
    }

    async deleteAllForUser(userId: string): Promise<void> {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException('Invalid user ID.');
        }

        const result = await this.notificationModel.deleteMany({ user: userId });
        if (result.deletedCount === 0) {
            throw new NotFoundException('No notifications found for user.');
        }
    }
}
