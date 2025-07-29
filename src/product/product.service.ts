import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { OrderItem } from '../orderItem/orderItem.entity';
import { Order } from '../order/order.entity';
import { BaseService } from 'src/common/services/base.service';

type BestSellingProduct = {
  productId: string;
  title: string;
  totalSold: string;
};

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    super(productRepo);
  }
  async getBestSellingProducts(
    companyId: string,
  ): Promise<BestSellingProduct[]> {
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.orderItems', 'orderItem')
      .leftJoin('orderItem.order', 'order')
      .select('product.id', 'productId')
      .addSelect('product.name', 'title')
      .addSelect('SUM(orderItem.quantity)', 'totalSold')
      .where('product.companyId = :companyId', { companyId })
      .andWhere('order.deletedAt IS NULL')
      .andWhere('order.orderType = :orderType', { orderType: 'shipment' })
      .groupBy('product.id')
      .orderBy('"totalSold"', 'DESC')
      .limit(5)
      .getRawMany<BestSellingProduct>();
  }
}
