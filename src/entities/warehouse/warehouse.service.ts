import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Warehouse } from './warehouse.entity';
import { OrderItem } from '../orderItem/orderItem.entity';
import { WarehouseTopStock } from './warehouse.static';

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {
    super(warehouseRepo);
  }

  async getProductWithHighestStock(
    companyId: string,
  ): Promise<WarehouseTopStock[]> {
    return this.orderItemRepo
      .createQueryBuilder('orderitem')
      .innerJoin('orderitem.order', 'order')
      .innerJoin('orderitem.product', 'product')
      .innerJoin('order.warehouse', 'warehouse')
      .select('warehouse.id', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect(
        `SUM(
           CASE
             WHEN "order"."order_type" = 'delivery' THEN orderitem.quantity
             WHEN "order"."order_type" = 'shipment' THEN -orderitem.quantity
             ELSE 0
           END
         )`,
        'stock',
      )
      .where('"order"."company_id" = :companyId', { companyId })
      .andWhere('warehouse."company_id" = :companyId', { companyId })
      .andWhere('"order"."deleted_at" IS NULL')
      .andWhere('orderitem."deleted_at" IS NULL')
      .andWhere('product."deleted_at" IS NULL')
      .andWhere('warehouse."deleted_at" IS NULL')
      .groupBy('warehouse.id')
      .addGroupBy('warehouse.name')
      .addGroupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('warehouse.name')
      .addOrderBy('stock', 'DESC')
      .getRawMany<WarehouseTopStock>();
  }
}
