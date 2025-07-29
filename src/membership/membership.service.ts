import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MembershipType,
  MembershipTypeDocument,
} from './schema/membership.schema';
import {
  CreateMembershipTypeDto,
  UpdateMembershipTypeDto,
} from '../common/dto/membership.dto';

@Injectable()
export class MembershipTypeService {
  constructor(
    @InjectModel(MembershipType.name)
    private readonly membershipTypeModel: Model<MembershipTypeDocument>,
  ) {}

  async create(dto: CreateMembershipTypeDto): Promise<MembershipType> {
    const membership = new this.membershipTypeModel(dto);
    return membership.save();
  }

  async findAll(): Promise<MembershipType[]> {
    return this.membershipTypeModel.find().exec();
  }

  async findOne(id: string): Promise<MembershipType> {
    const membership = await this.membershipTypeModel.findById(id).exec();
    if (!membership) {
      throw new NotFoundException(`Membership type with ID ${id} not found`);
    }
    return membership;
  }

  async update(
    id: string,
    dto: UpdateMembershipTypeDto,
  ): Promise<MembershipType> {
    const updated = await this.membershipTypeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Membership type with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.membershipTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Membership type with ID ${id} not found`);
    }
    return { message: 'Membership type deleted successfully' };
  }
}
