import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserMembershipDocument } from './schema/membership.schema';
import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class MembershipExpirationService {
  private readonly logger = new Logger(MembershipExpirationService.name);

  constructor(
    @InjectModel('UserMembership')
    private readonly membershipModel: Model<UserMembershipDocument>,
    private readonly notificationService: NotificationService,
  ) { }

  @Cron('0 0 * * *')
  async handleExpiredMemberships() {
    const now = new Date();
    this.logger.debug(`Running expiration job at ${now.toISOString()}`);
    const result = await this.membershipModel.updateMany(
      { isActive: true, endDate: { $lt: now } },
      { $set: { isActive: false } }
    );
    this.logger.log(`Marked ${result.modifiedCount ?? 0} memberships as expired`);
    const recentlyExpired = await this.membershipModel.find({
      isActive: false,
      endDate: { $lt: now },
      updatedAt: { $gte: new Date(now.getTime() - 1000 * 60 * 60 * 24) },
    });

    for (const membership of recentlyExpired) {
      const userId = membership.user?.toString();
      if (!userId) continue;
      try {
        await this.notificationService.create({
          user: userId,
          message: 'Your membership has expired. Please renew to continue enjoying our services.',
        });
        this.logger.log(`Notification sent to user ${userId}`);
      } catch (error) {
        this.logger.error(`Failed to notify user ${userId}: ${error.message}`);
      }
    }
  }
}
