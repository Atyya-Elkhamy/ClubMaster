import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserMembershipDocument } from './membership.schema';
import { MembershipTypeDocument } from './membership.schema';

@Injectable()
export class UserMembershipHooks {
  constructor(
    @InjectModel('MembershipType')
    private readonly membershipTypeModel: Model<MembershipTypeDocument>
  ) {}

  async calculateEndDate(userMembership: UserMembershipDocument): Promise<void> {
    if (!userMembership.isModified('startDate') && userMembership.endDate) return;

    const membershipType = await this.membershipTypeModel
      .findById(userMembership.membershipType);

    if (membershipType) {
      const startDate = new Date(userMembership.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + membershipType.durationInDays);
      userMembership.endDate = endDate;
    }
  }
}