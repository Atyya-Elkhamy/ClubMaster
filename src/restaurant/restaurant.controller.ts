import { Body, Controller, Post } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from 'src/common/dto/restaurant.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post('create')
  async createRestaurant(@Body() restaurantData: any) {
    return this.restaurantService.createRestaurant(restaurantData);
  }

  @Post('find')
  async findRestaurant() {
    return this.restaurantService.findRestaurant();
  }

  @Post('update')
  async updateRestaurant(
    @Body() body: { id: string; updateData: UpdateRestaurantDto },
  ) {
    const { id, updateData } = body;
    return this.restaurantService.updateRestaurant(id, updateData);
  }

  @Post('delete')
  async deleteRestaurant(@Body() body: { id: string }) {
    const { id } = body;
    return this.restaurantService.deleteRestaurant(id);
  }

  @Post('findAll')
  async findAllRestaurants() {
    return this.restaurantService.findRestaurant();
  }

  @Post('findById')
  async findRestaurantById(@Body() body: { id: string }) {
    const { id } = body;
    return this.restaurantService.findRestaurantById(id);
  }

  @Post('findByName')
  async findRestaurantByName(@Body() body: { name: string }) {
    const { name } = body;
    return this.restaurantService.findRestaurantByName(name);
  }
}
