import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartHistory, CartHistoryDocument } from './schema/cartHistory.schema';
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDto, UpdateProductDto } from '../common/dto/product.dto';
import { Cart, CartDocument } from './schema/userCart.schema';
import { UpdateCartDto } from '../common/dto/userCart.dto';
import { Types } from 'mongoose';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { IProduct } from 'src/common/interfaces/product.interface';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(CartHistory.name)
    private readonly cartHistoryModel: Model<CartHistoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async getAllCartHistory(userId: string) {
    return this.cartHistoryModel
      .find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
  }

  async deleteCartHistoryById(id: string) {
    const deleted = await this.cartHistoryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Cart history not found');
    return { message: 'Deleted successfully' };
  }

  async deleteAllCartHistoryForUser(userId: string) {
    await this.cartHistoryModel.deleteMany({ user: userId });
    return { message: 'All history deleted for user' };
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productModel.findOne({
      name: dto.name,
    });
    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }
    return this.productModel.create(dto);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productModel.find().sort({ createdAt: -1 });
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async deleteProduct(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Product not found');
    return { message: 'Deleted successfully' };
  }

  async addItemToCart(
    userId: string,
    productId: string,
    quantity: number = 1,
  ): Promise<Cart> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock <= 0) {
      throw new BadRequestException('Product is out of stock');
    }
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} items available in stock`,
      );
    }
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);
    let cart = await this.cartModel.findOne({ user: userObjectId });
    const itemQuantity = Math.min(quantity, product.stock); // Ensure we don't exceed stock
    if (!cart) {
      cart = new this.cartModel({
        user: userObjectId,
        items: [{ product: productObjectId, quantity: itemQuantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex((item) =>
        item.product.equals(productObjectId),
      );
      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + itemQuantity;
        if (newQuantity > product.stock) {
          throw new BadRequestException(
            `Cannot add more than ${product.stock} items total for this product`,
          );
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ product: productObjectId, quantity: itemQuantity });
      }
    }
    await cart.save();
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { stock: -itemQuantity },
    });
    return cart;
  }

  async removeItemFromCart(
    userId: string,
    productId: string,
  ): Promise<{ message: string; cart: Cart }> {
    const cart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('items.product');
    if (!cart) throw new NotFoundException('Cart not found');
    const initialItemCount = cart.items.length;
    if (initialItemCount === 0) {
      throw new NotFoundException('Cart is empty');
    }
    const productObjectId = new Types.ObjectId(productId);
    const productExists = cart.items.some((item) => {
      const product = item.product as unknown as { _id: Types.ObjectId };
      return product._id.equals(productObjectId);
    });
    if (!productExists) {
      throw new NotFoundException('Product not found in cart');
    }
    cart.items = cart.items.filter(
      (item) => !item.product._id.equals(new Types.ObjectId(productId)),
    );
    if (cart.items.length === initialItemCount) {
      throw new NotFoundException('Product not found in cart');
    }
    const updatedCart = await cart.save();
    return {
      message: 'Product successfully removed from cart',
      cart: updatedCart,
    };
  }

  async updateCart(userId: string, dto: UpdateCartDto): Promise<Cart> {
    // Find user's cart
    const cart = await this.cartModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Cart not found');
    // Validate items exist in request
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Cart items cannot be empty');
    }
    // Check all quantities are positive
    dto.items.forEach((item) => {
      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Quantity must be positive for product ${item.product}`,
        );
      }
    });
    // Get product IDs and fetch products
    const productIds = dto.items.map(
      (item) => new Types.ObjectId(item.product),
    );
    const existingProducts = await this.productModel.find({
      _id: { $in: productIds },
    });
    // Check all products exist
    if (existingProducts.length !== dto.items.length) {
      const missingIds = productIds
        .filter((id) => {
          return !existingProducts.some((p) => {
            const productId = p._id?.toString();
            return productId === id.toString();
          });
        })
        .map((id) => id.toString());
      throw new NotFoundException(
        `The following product IDs were not found: ${missingIds.join(', ')}`,
      );
    }
    // Create a map of product ID to product for quick lookup
    const productMap = new Map(
      (existingProducts as IProduct[]).map((product) => [
        product._id.toString(),
        product,
      ]),
    );
    // Validate quantities against stock
    for (const item of dto.items) {
      const product = productMap.get(item.product);
      if (!product) continue; // This shouldn't happen due to previous check

      if (item.quantity > product.stock) {
        throw new BadRequestException(
          `Cannot add more than ${product.stock} items for product ${item.product}`,
        );
      }
    }
    // Update cart items
    cart.items = dto.items.map((item) => ({
      product: new Types.ObjectId(item.product),
      quantity: item.quantity,
    }));
    return cart.save();
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .exec();
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }
}
