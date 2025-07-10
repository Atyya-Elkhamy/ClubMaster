import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CateringProviderDocument } from './schema/catering-provider.schema';
import { FleetProviderDocument } from './schema/fleet-provider.schema';
import {
  CreateCateringProviderDto,
  UpdateCateringProviderDto,
} from '../common/dto/catering-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectModel('CateringProvider')
    private readonly cateringProviderModel: Model<CateringProviderDocument>,
    @InjectModel('FleetProvider')
    private readonly fleetProviderModel: Model<FleetProviderDocument>,
  ) {}

  async create(dto: CreateCateringProviderDto) {
    const created = new this.cateringProviderModel(dto);
    return await created.save();
  }

  async findAll() {
    return await this.cateringProviderModel.find().populate('menuItems').exec();
  }

  async findOne(id: string) {
    const item = await this.cateringProviderModel
      .findById(id)
      .populate('menuItems')
      .exec();
    if (!item) throw new NotFoundException('Catering Provider not found');
    return item;
  }

  async update(id: string, dto: UpdateCateringProviderDto) {
    const updated = await this.cateringProviderModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('menuItems')
      .exec();
    if (!updated) throw new NotFoundException('Catering Provider not found');
    return updated;
  }

  async remove(id: string) {
    const result = await this.cateringProviderModel
      .findByIdAndDelete(id)
      .exec();
    if (!result) throw new NotFoundException('Catering Provider not found');
  }
}
