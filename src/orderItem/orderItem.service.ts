import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderItem } from './orderItem.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class OrderItemService extends BaseService<OrderItem> {
  constructor(
    @InjectRepository(OrderItem) repo: Repository<OrderItem>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly dataSource: DataSource,
  ) {
    super(repo);
  }

  async findByOrder(orderId: string) {
    return this.repo.find({ where: { orderId } });
  }

  async findByProduct(productId: string): Promise<OrderItem[]> {
    return this.repo.find({
      where: { productId },
    });
  }
}
