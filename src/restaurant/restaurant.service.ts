import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantDocument } from './schema/restaurant.schema';
import { ContactChannelDocument } from './schema/contact-channel.schema';
import { MenuItemDocument } from './schema/menu-item.schema';
import { UpdateRestaurantDto } from 'src/common/dto/restaurant.dto';
import { PromoCodeDocument } from './schema/promo-code.schema';
import {
  CreateContactChannelDto,
  UpdateContactChannelDto,
} from 'src/common/dto/contact-channel.dto';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from 'src/common/dto/menu-item.dto';
import {
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
} from 'src/common/dto/promo-code.dto';
@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel('Restaurant')
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel('MenuItem')
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel('ContactChannel')
    private readonly contactChannelModel: Model<ContactChannelDocument>,
    @InjectModel('PromoCode')
    private readonly promoCodeModel: Model<PromoCodeDocument>,
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
    if (!updateData || !id) {
      throw new NotFoundException('Restaurant not found');
    }
    const updated = await this.restaurantModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    return updated;
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

  // contact channels methods

  async createContactChannel(
    restaurantId: string,
    dto: CreateContactChannelDto,
  ) {
    return this.contactChannelModel.create({
      ...dto,
      restaurant: restaurantId,
    });
  }

  async getAllContactChannels(restaurantId: string) {
    return this.contactChannelModel.find({ restaurant: restaurantId }).exec();
  }

  async getContactChannelById(id: string) {
    return this.contactChannelModel.findById(id).exec();
  }

  async updateContactChannel(id: string, dto: UpdateContactChannelDto) {
    return this.contactChannelModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
  }

  async deleteContactChannel(id: string) {
    return this.contactChannelModel.findByIdAndDelete(id);
  }

  // Menu items methods

  async createMenuItem(restaurantId: string, dto: CreateMenuItemDto) {
    return this.menuItemModel.create({ ...dto, restaurant: restaurantId });
  }

  async getMenuItems(restaurantId: string, search?: string) {
    const filter: Record<string, any> = { restaurant: restaurantId };
    if (search) {
      filter.$text = { $search: search };
    }
    return this.menuItemModel.find(filter).exec();
  }

  async getMenuItemById(id: string) {
    return this.menuItemModel.findById(id).exec();
  }

  async updateMenuItem(id: string, dto: UpdateMenuItemDto) {
    return this.menuItemModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
  }

  async deleteMenuItem(id: string) {
    return this.menuItemModel.findByIdAndDelete(id);
  }

  // Promo codes methods
  async createPromoCode(restaurantId: string, dto: CreatePromoCodeDto) {
    return this.promoCodeModel.create({ ...dto, restaurant: restaurantId });
  }

  async getAllPromoCodes(restaurantId: string) {
    return this.promoCodeModel.find({ restaurant: restaurantId }).exec();
  }

  async getPromoCodeById(id: string) {
    return this.promoCodeModel.findById(id).exec();
  }

  async updatePromoCode(id: string, dto: UpdatePromoCodeDto) {
    return this.promoCodeModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
  }

  async deletePromoCode(id: string) {
    return this.promoCodeModel.findByIdAndDelete(id);
  }
}
