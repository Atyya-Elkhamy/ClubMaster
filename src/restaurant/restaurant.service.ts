import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schema/restaurant.schema';
import { ContactChannel,ContactChannelDocument } from './schema/contact-channel.schema';
import { MenuItem, MenuItemDocument } from './schema/menu-item.schema';

@Injectable()
export class RestaurantService {
    constructor(
        @InjectModel('Restaurant') private readonly restaurantModel: Model<RestaurantDocument>,
        @InjectModel('MenuItem') private readonly menuItemModel: Model<MenuItemDocument>,
        @InjectModel('ContactChannel') private readonly contactChannelModel: Model<ContactChannelDocument>,
    ) {}
    
    async createRestaurant(restaurantData: any) {
        const newRestaurant = new this.restaurantModel(restaurantData);
        return await newRestaurant.save();
    }
    
    async getRestaurants() {
        return await this.restaurantModel.find().populate('menuItems').populate('contactChannels');
    }
    
    async updateRestaurant(id: string, updateData: any) {
        return await this.restaurantModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    
    async deleteRestaurant(id: string) {
        return await this.restaurantModel.findByIdAndDelete(id);
    }
}
