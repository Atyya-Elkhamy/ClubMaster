import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Put,
  HttpCode,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateProductDto, UpdateProductDto } from '../common/dto/product.dto';
import { UpdateCartDto } from '../common/dto/userCart.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ---------- 🔁 CART HISTORY ----------

  @Get('history/:userId')
  getAllHistory(@Param('userId') userId: string) {
    return this.storeService.getAllCartHistory(userId);
  }

  @Delete('history/:id')
  deleteOneHistory(@Param('id') id: string) {
    return this.storeService.deleteCartHistoryById(id);
  }

  @Delete('history/user/:userId')
  deleteAllHistory(@Param('userId') userId: string) {
    return this.storeService.deleteAllCartHistoryForUser(userId);
  }

  // ---------- 📦 PRODUCTS ----------

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

  @Put('product/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.storeService.updateProduct(id, dto);
  }

  @Delete('product/:id')
  deleteProduct(@Param('id') id: string) {
    return this.storeService.deleteProduct(id);
  }

  // ---------- 🛒 USER CART ----------

  @Post('cart/add-item')
  async addItem(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number = 1,
  ) {
    return this.storeService.addItemToCart(userId, productId, quantity);
  }

  @Put('cart/:userId')
  async updateCart(
    @Param('userId') userId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.storeService.updateCart(userId, dto);
  }

  @Get('cart/:userId')
  async getCart(@Param('userId') userId: string) {
    return this.storeService.getCartByUserId(userId);
  }

  @Delete('cart/remove-item')
  @HttpCode(204) // No Content (successful deletion)
  async removeItem(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
  ) {
    await this.storeService.removeItemFromCart(userId, productId);
  }
}
