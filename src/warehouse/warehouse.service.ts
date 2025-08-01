import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Warehouse } from './warehouse.entity';
import { OrderItem } from '../orderItem/orderItem.entity';
import { WarehouseTopStockType } from './warehouse.types';
import { AuthUser } from 'src/common/types/auth-user';
import { UpdateWarehouseInput } from './warehouse.inputs';

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

  override async updateWithUserContext(
    id: string,
    input: UpdateWarehouseInput,
    user: AuthUser,
  ): Promise<Warehouse> {
    const existing = await this.repo.findOneOrFail({
      where: { id, companyId: user.companyId },
    });

    const isChangingType =
      input.supportedType && input.supportedType !== existing.supportedType;

    if (isChangingType) {
      const count = await this.orderItemRepo
        .createQueryBuilder('orderItem')
        .innerJoin('orders', 'o', 'orderItem.order_id = o.id')
        .where('o.warehouse_id = :warehouseId', { warehouseId: id })
        .andWhere('orderItem.deleted_at IS NULL')
        .andWhere('o.deleted_at IS NULL')
        .getCount();

      if (count > 0) {
        throw new BadRequestException(
          'Cannot change supportedType: warehouse has order items.',
        );
      }
    }

    const updated = this.repo.merge(existing, {
      ...input,
      modifiedByUserId: user.userId,
    });

    return this.repo.save(updated);
  }

  async getProductWithHighestStock(
    companyId: string,
  ): Promise<WarehouseTopStockType[]> {
    return this.orderItemRepo
      .createQueryBuilder('orderitem')
      .innerJoin('orders', 'orders', 'orders.id = orderitem.order_id')
      .innerJoin('product', 'product', 'product.id = orderitem.product_id')
      .innerJoin('warehouse', 'warehouse', 'warehouse.id = orders.warehouse_id')
      .select('warehouse.id', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect(
        `SUM(
       CASE
         WHEN orders.order_type = 'delivery' THEN orderitem.quantity
         WHEN orders.order_type = 'shipment' THEN -orderitem.quantity
         ELSE 0
       END
     )`,
        'stock',
      )
      .where('warehouse.company_id = :companyId', { companyId })
      .andWhere('orders.deleted_at IS NULL')
      .andWhere('orderitem.deleted_at IS NULL')
      .andWhere('product.deleted_at IS NULL')
      .andWhere('warehouse.deleted_at IS NULL')
      .groupBy('warehouse.id')
      .addGroupBy('warehouse.name')
      .addGroupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('warehouse.name')
      .addOrderBy('stock', 'DESC')
      .getRawMany<WarehouseTopStockType>();
  }

  async getWarehouseStockBreakdown(
    warehouseId: string,
    companyId: string,
  ): Promise<WarehouseTopStockType[]> {
    const warehouse = await this.warehouseRepo.findOne({
      where: { id: warehouseId, companyId },
    });

    if (!warehouse) {
      throw new UnauthorizedException('Access denied to this warehouse');
    }

    return this.orderItemRepo
      .createQueryBuilder('orderitem')
      .innerJoin('orders', 'orders', 'orders.id = orderitem.order_id')
      .innerJoin('product', 'product', 'product.id = orderitem.product_id')
      .innerJoin('warehouse', 'warehouse', 'warehouse.id = orders.warehouse_id')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('warehouse.id', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect(
        `SUM(
          CASE
            WHEN orders.order_type = 'delivery' THEN orderitem.quantity
            WHEN orders.order_type = 'shipment' THEN -orderitem.quantity
            ELSE 0
          END
        )`,
        'stock',
      )
      .where('orders.warehouse_id = :warehouseId', { warehouseId })
      .andWhere('orders.deleted_at IS NULL')
      .andWhere('orderitem.deleted_at IS NULL')
      .andWhere('product.deleted_at IS NULL')
      .andWhere('warehouse.deleted_at IS NULL')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('warehouse.id')
      .addGroupBy('warehouse.name')
      .orderBy('stock', 'DESC')
      .getRawMany<WarehouseTopStockType>();
  }
}
