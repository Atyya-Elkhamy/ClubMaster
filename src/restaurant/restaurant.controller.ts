import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from 'src/common/dto/restaurant.dto';
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

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post('create')
  async createRestaurant(@Body() restaurantData: any) {
    return this.restaurantService.createRestaurant(restaurantData);
  }

  @Get('find')
  async findRestaurant() {
    return this.restaurantService.findRestaurant();
  }

  @Post('update')
  async updateRestaurant(
    @Body() body: { id: string; updateData: UpdateRestaurantDto },
  ) {
    if (!body || !body.id || !body.updateData) {
      throw new BadRequestException('ID and update data are required');
    }
    const { id, updateData } = body;
    return this.restaurantService.updateRestaurant(id, updateData);
  }

  @Post('delete')
  async deleteRestaurant(@Body() body: { id: string }) {
    const { id } = body;
    return this.restaurantService.deleteRestaurant(id);
  }

  @Get('findById')
  async findRestaurantById(@Body() body: { id: string }) {
    const { id } = body;
    return this.restaurantService.findRestaurantById(id);
  }

  @Get('findByName')
  async findRestaurantByName(@Body() body: { name: string }) {
    const { name } = body;
    return this.restaurantService.findRestaurantByName(name);
  }
  // Contact Channels Endpoints
  @Post(':restaurantId/contact-channels')
  createContactChannel(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateContactChannelDto,
  ) {
    return this.restaurantService.createContactChannel(restaurantId, dto);
  }

  @Get(':restaurantId/contact-channels')
  getAllContactChannels(@Param('restaurantId') restaurantId: string) {
    return this.restaurantService.getAllContactChannels(restaurantId);
  }

  @Get(':restaurantId/contact-channels/:id')
  getContactChannelById(@Param('id') id: string) {
    return this.restaurantService.getContactChannelById(id);
  }

  @Patch(':restaurantId/contact-channels/:id')
  updateContactChannel(
    @Param('id') id: string,
    @Body() dto: UpdateContactChannelDto,
  ) {
    return this.restaurantService.updateContactChannel(id, dto);
  }

  @Delete(':restaurantId/contact-channels/:id')
  deleteContactChannel(@Param('id') id: string) {
    return this.restaurantService.deleteContactChannel(id);
  }

  // Menu Items Endpoints

  @Post(':restaurantId/menu-items')
  createMenuItem(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.restaurantService.createMenuItem(restaurantId, dto);
  }

  @Get(':restaurantId/menu-items')
  getMenuItems(
    @Param('restaurantId') restaurantId: string,
    @Query('search') search?: string,
  ) {
    return this.restaurantService.getMenuItems(restaurantId, search);
  }

  @Get(':restaurantId/menu-items/:id')
  getMenuItem(@Param('id') id: string) {
    return this.restaurantService.getMenuItemById(id);
  }

  @Patch(':restaurantId/menu-items/:id')
  updateMenuItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.restaurantService.updateMenuItem(id, dto);
  }

  @Delete(':restaurantId/menu-items/:id')
  deleteMenuItem(@Param('id') id: string) {
    return this.restaurantService.deleteMenuItem(id);
  }

  // Promo Codes Endpoints

  @Post(':restaurantId/promo-codes')
  createPromoCode(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreatePromoCodeDto,
  ) {
    return this.restaurantService.createPromoCode(restaurantId, dto);
  }

  @Get(':restaurantId/promo-codes')
  getAllPromoCodes(@Param('restaurantId') restaurantId: string) {
    return this.restaurantService.getAllPromoCodes(restaurantId);
  }

  @Get(':restaurantId/promo-codes/:id')
  getPromoCodeById(@Param('id') id: string) {
    return this.restaurantService.getPromoCodeById(id);
  }

  @Patch(':restaurantId/promo-codes/:id')
  updatePromoCode(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    return this.restaurantService.updatePromoCode(id, dto);
  }

  @Delete(':restaurantId/promo-codes/:id')
  deletePromoCode(@Param('id') id: string) {
    return this.restaurantService.deletePromoCode(id);
  }
}
