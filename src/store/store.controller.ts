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
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateProductDto, UpdateProductDto } from '../common/dto/product.dto';
import { UpdateCartDto } from '../common/dto/userCart.dto';
import { Roles } from 'src/common/guards/roles_guard';
import { JwtAuthGuard } from 'src/common/guards/auth.guards-jwt';
import { RolesGuard } from 'src/common/guards/roles_guard';
import { UserRole } from 'src/users/users.schema';
import { Product } from './schema/product.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { productMulterConfig } from 'src/common/utils/multre.config';
import { AuthenticatedRequest } from 'src/common/interfaces/users.interface';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ---------- 🔁 CART HISTORY ----------
  // Get authenticated user's history (partner)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('history')
  getAllHistory(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.storeService.getAllCartHistory(userId);
  }

  // Delete single history entry (partner) - kept as-is (id of history entry)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Delete('history/:id')
  deleteOneHistory(@Param('id') id: string) {
    return this.storeService.deleteCartHistoryById(id);
  }

  // Delete all history for authenticated user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Delete('history')
  deleteAllHistory(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
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
  // Add item to authenticated user's cart
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post('cart/add-item')
  async addItem(
    @Req() req: AuthenticatedRequest,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number = 1,
  ) {
    const userId = req.user.id;
    return this.storeService.addItemToCart(userId, productId, quantity);
  }

  // Update authenticated user's cart
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Put('cart')
  async updateCart(@Req() req: AuthenticatedRequest, @Body() dto: UpdateCartDto) {
    const userId = req.user.id;
    return this.storeService.updateCart(userId, dto);
  }

  // Get authenticated user's cart
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('cart')
  async getCart(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.storeService.getCartByUserId(userId);
  }

  // Remove item from authenticated user's cart
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Delete('cart/remove-item')
  @HttpCode(204) // No Content
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Body('productId') productId: string,
  ) {
    const userId = req.user.id;
    await this.storeService.removeItemFromCart(userId, productId);
  }

  // Search products (public)
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

  // ---------- 🖼 PRODUCT PICTURES ----------
  @UseGuards(JwtAuthGuard) 
  @Post(':id/pictures')
  @UseInterceptors(FileInterceptor('picture', productMulterConfig))
  async uploadPicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const product = await this.storeService.addPicture(id, file);
    return {
      message: 'Picture uploaded',
      data: product,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/pictures')
  async deletePicture(
    @Param('id') id: string,
    @Query('filename') filename: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!filename) throw new BadRequestException('filename query parameter is required');
    const product = await this.storeService.removePicture(id, filename);
    return {
      message: 'Picture removed',
      data: product,
    };
  }
}
