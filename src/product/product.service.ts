import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { BaseService } from 'src/common/services/base.service';
import { BestSellingProductType } from './product.types';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
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
}
