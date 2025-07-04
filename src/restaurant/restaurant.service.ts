import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantDocument } from './schema/restaurant.schema';
import { ContactChannelDocument } from './schema/contact-channel.schema';
import { MenuItemDocument } from './schema/menu-item.schema';
import { UpdateRestaurantDto } from 'src/common/dto/restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel('Restaurant')
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel('MenuItem')
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel('ContactChannel')
    private readonly contactChannelModel: Model<ContactChannelDocument>,
  ) {}

  async createRestaurant(restaurantData: any) {
    const newRestaurant = new this.restaurantModel(restaurantData);
    return await newRestaurant.save();
  }

  async findRestaurant() {
    return await this.restaurantModel
      .find()
      .populate('menuItems')
      .populate('contactChannels');
  }

  async updateRestaurant(id: string, updateData: UpdateRestaurantDto) {
    return await this.restaurantModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async deleteRestaurant(id: string) {
    return await this.restaurantModel.findByIdAndDelete(id);
  }

  async findRestaurantById(id: string) {
    return await this.restaurantModel
      .findById(id)
      .populate('menuItems')
      .populate('contactChannels');
  }

  async findRestaurantByName(name: string) {
    return await this.restaurantModel
      .findOne({ name })
      .populate('menuItems')
      .populate('contactChannels');
  }
}
