import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApolloError, UserInputError } from 'apollo-server-core';

import { OrderItem } from './orderItem.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { BaseService } from 'src/common/services/base.service';
import { AuthUser } from 'src/common/types/auth-user';
import { CreateOrderItem, UpdateOrderItem } from './orderItem.types';

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
    return this.repo.find({ where: { productId } });
  }

  override async createWithUserContext(
    dto: CreateOrderItem,
    user: AuthUser,
  ): Promise<OrderItem> {
    await this.runAllValidations(dto, user.companyId);

    const entity: Partial<OrderItem> = {
      unitPrice: dto.unitPrice,
      quantity: dto.quantity,
      orderId: dto.orderId,
      productId: dto.productId,
      modifiedByUserId: user.userId,
    };

    return this.repo.save(this.repo.create(entity));
  }

  override async updateWithUserContext(
    id: string,
    dto: UpdateOrderItem,
    user: AuthUser,
  ): Promise<OrderItem> {
    const existing = await this.findOne(id, user.companyId);
    if (!existing) {
      throw new ForbiddenException('Order item not found or access denied');
    }

    const updated: Partial<OrderItem> = {
      ...existing,
      ...dto,
      modifiedByUserId: user.userId,
    };

    await this.runAllValidations(updated, user.companyId);

    Object.assign(existing, updated);
    return this.repo.save(existing);
  }

  private async runAllValidations(
    dto: Partial<CreateOrderItem>,
    companyId: string,
  ) {
    await this.validateWarehouseSupportsProductType(dto, companyId);
    await this.validateShipmentStockAvailability(dto, companyId);
  }

  private async validateWarehouseSupportsProductType(
    dto: Partial<CreateOrderItem>,
    companyId: string,
  ) {
    if (!dto.orderId || !dto.productId) return;

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, companyId },
    });
    if (!order) throw new UserInputError('Order not found');

    const warehouse = await this.warehouseRepo.findOne({
      where: { id: order.warehouseId, companyId },
    });
    if (!warehouse) throw new UserInputError('Warehouse not found');

    const product = await this.productRepo.findOne({
      where: { id: dto.productId, companyId },
    });
    if (!product) throw new UserInputError('Product not found');

    if (warehouse.supportedType !== product.productType) {
      throw new ApolloError(
        `Cannot store ${product.productType} products in a ${warehouse.supportedType} warehouse.`,
        'WAREHOUSE_TYPE_MISMATCH',
      );
    }
  }

  private async validateShipmentStockAvailability(
    dto: Partial<CreateOrderItem>,
    companyId: string,
  ) {
    if (!dto.orderId || !dto.productId || typeof dto.quantity !== 'number')
      return;

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, companyId },
    });
    if (!order) throw new UserInputError('Order not found');

    if (order.orderType !== 'shipment') return;

    const orderItems = await this.repo
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'o')
      .where('orderItem.productId = :productId', { productId: dto.productId })
      .andWhere('o.warehouse_id = :warehouseId', {
        warehouseId: order.warehouseId,
      })
      .andWhere('orderItem.deletedAt IS NULL')
      .andWhere('o.deletedAt IS NULL')
      .getMany();

    let availableStock = 0;

    for (const item of orderItems) {
      if (item.orderId === order.id) continue;

      const itemOrder = await this.orderRepo.findOne({
        where: { id: item.orderId, companyId },
      });
      if (!itemOrder) continue;

      availableStock +=
        itemOrder.orderType === 'delivery' ? item.quantity : -item.quantity;
    }

    if (availableStock < dto.quantity) {
      throw new ApolloError(
        `Insufficient stock: Available ${availableStock}, Requested ${dto.quantity}`,
        'INSUFFICIENT_STOCK',
      );
    }
  }
}
