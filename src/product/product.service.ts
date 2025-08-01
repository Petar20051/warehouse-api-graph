import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { BaseService } from 'src/common/services/base.service';
import { BestSellingProductType } from './product.types';
import { OrderItem } from 'src/orderItem/orderItem.entity';
import { AuthUser } from 'src/common/types/auth-user';
import { MessagePayload } from 'src/auth/auth.types';
import { UpdateProductInput } from './product.inputs';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {
    super(productRepo);
  }

  async getBestSellingProducts(
    companyId: string,
  ): Promise<BestSellingProductType[]> {
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoin('order_item', 'orderItem', 'orderItem.product_id = product.id')
      .leftJoin('orders', 'orders', 'orders.id = orderItem.order_id')
      .select('product.id', 'productId')
      .addSelect('product.name', 'title')
      .addSelect('SUM(orderItem.quantity)', 'totalSold')
      .where('product.company_id = :companyId', { companyId })
      .andWhere('product.deleted_at IS NULL')
      .andWhere('orderItem.deleted_at IS NULL')
      .andWhere('orders.deleted_at IS NULL')
      .andWhere('orders.order_type = :orderType', { orderType: 'shipment' })
      .groupBy('product.id')
      .limit(5)
      .getRawMany<BestSellingProductType>();
  }

  override async updateWithUserContext(
    id: string,
    data: Partial<UpdateProductInput>,
    user: AuthUser,
  ): Promise<Product> {
    const existing = await this.findOne(id, user.companyId);
    if (!existing) throw new BadRequestException('Product not found');

    if (data.productType && data.productType !== existing.productType) {
      const used = await this.orderItemRepo.count({
        where: { productId: existing.id },
      });

      if (used > 0) {
        throw new BadRequestException(
          'Cannot change product type. This product is already used in order items.',
        );
      }
    }

    const updated = await super.updateWithUserContext(id, data, user);
    if (!updated) {
      throw new BadRequestException('Failed to update product.');
    }
    return updated;
  }

  override async softDelete(
    id: string,
    user: AuthUser,
  ): Promise<MessagePayload> {
    const product = await this.findOne(id, user.companyId);

    const items = await this.orderItemRepo.count({
      where: { productId: product?.id },
    });

    if (items > 0) {
      throw new BadRequestException(
        'Cannot delete a product used in order items.',
      );
    }

    await super.softDelete(id, user);
    return { message: 'Product deleted successfully.' };
  }

  override async hardDelete(
    id: string,
    companyId: string,
  ): Promise<MessagePayload> {
    const product = await this.findOne(id, companyId);

    const items = await this.orderItemRepo.count({
      where: { productId: product?.id },
    });

    if (items > 0) {
      throw new BadRequestException(
        'Cannot hard delete a product used in order items.',
      );
    }

    await super.hardDelete(id, companyId);
    return { message: 'Product permanently deleted.' };
  }
}
