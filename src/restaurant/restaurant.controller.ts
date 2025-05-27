import { Body, Controller, Post } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
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
    async updateRestaurant() {
        return this.restaurantService.updateRestaurant();
    }
    @Post('delete')
    async deleteRestaurant() {
        return this.restaurantService.deleteRestaurant();
    }
    @Post('findAll')
    async findAllRestaurants() {
        return this.restaurantService.findAllRestaurants();
    }
    @Post('findById')
    async findRestaurantById() {
        return this.restaurantService.findRestaurantById();
    }
    @Post('findByName')
    async findRestaurantByName() {
        return this.restaurantService.findRestaurantByName();
    }
}
