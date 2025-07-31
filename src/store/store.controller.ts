import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Put,
  HttpCode,
  Query,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateProductDto, UpdateProductDto } from '../common/dto/product.dto';
import { UpdateCartDto } from '../common/dto/userCart.dto';
import { Roles } from 'src/common/guards/roles_guard';
import { JwtAuthGuard } from '../common/guards/auth.guards-jwt';
import { UseGuards, Request } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles_guard';
import { UserRole } from 'src/users/users.schema';
import { Product } from './schema/product.schema';


@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  // ---------- 🔁 CART HISTORY ----------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('history/:userId')
  getAllHistory(@Param('userId') userId: string) {
    return this.storeService.getAllCartHistory(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Delete('history/:id')
  deleteOneHistory(@Param('id') id: string) {
    return this.storeService.deleteCartHistoryById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Delete('history/user/:userId')
  deleteAllHistory(@Param('userId') userId: string) {
    return this.storeService.deleteAllCartHistoryForUser(userId);
  }

  // ---------- 📦 PRODUCTS ----------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('product')
  createProduct(@Body() dto: CreateProductDto) {
    return this.storeService.createProduct(dto);
  }

  @Get('products')
  getAllProducts() {
    return this.storeService.getAllProducts();
  }

  @Get('product/:id')
  getProduct(@Param('id') id: string) {
    return this.storeService.getProductById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('product/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.storeService.updateProduct(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('product/:id')
  deleteProduct(@Param('id') id: string) {
    return this.storeService.deleteProduct(id);
  }

  // ---------- 🛒 USER CART ----------

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post('cart/add-item')
  async addItem(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number = 1,
  ) {
    return this.storeService.addItemToCart(userId, productId, quantity);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Put('cart/:userId')
  async updateCart(
    @Param('userId') userId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.storeService.updateCart(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('cart/:userId')
  async getCart(@Param('userId') userId: string) {
    return this.storeService.getCartByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Delete('cart/remove-item')
  @HttpCode(204) // No Content (successful deletion)
  async removeItem(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
  ) {
    await this.storeService.removeItemFromCart(userId, productId);
  }

  @Get('search')
  async searchProducts(
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<Product[]> {
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    return this.storeService.searchByNameAndPrice(name, min, max);
  }


}
