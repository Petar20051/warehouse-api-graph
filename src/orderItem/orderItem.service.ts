import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApolloError, UserInputError } from 'apollo-server-core';

import { OrderItem } from './orderItem.entity';
import { BaseService } from 'src/common/services/base.service';
import { AuthUser } from 'src/common/types/auth-user';
import { CreateOrderItem, UpdateOrderItem } from './orderItem.types';

import { OrderService } from 'src/order/order.service';
import { ProductService } from 'src/product/product.service';
import { WarehouseService } from 'src/warehouse/warehouse.service';
import { OrderTypeEnum } from 'src/order/order.static';

@Injectable()
export class OrderItemService extends BaseService<OrderItem> {
  constructor(
    @InjectRepository(OrderItem) repo: Repository<OrderItem>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly warehouseService: WarehouseService,
  ) {
    super(repo);
  }

  async findAllByCompany(companyId: string): Promise<OrderItem[]> {
    return this.repo
      .createQueryBuilder('orderItem')
      .innerJoin('orders', 'o', 'orderItem.order_id = o.id')
      .where('o.company_id = :companyId', { companyId })
      .getMany();
  }

  async findOne(id: string, companyId: string): Promise<OrderItem | null> {
    return this.repo
      .createQueryBuilder('orderItem')
      .innerJoin('orders', 'o', 'orderItem.order_id = o.id')
      .where('o.company_id = :companyId', { companyId })
      .andWhere('orderItem.id = :id', { id })
      .getOne();
  }

  async findByOrder(orderId: string) {
    return this.repo.find({ where: { orderId } });
  }

  async findByProduct(productId: string) {
    return this.repo.find({ where: { productId } });
  }

  override async createWithUserContext(
    dto: CreateOrderItem,
    user: AuthUser,
  ): Promise<OrderItem> {
    await this.runAllValidations(dto, user.companyId);

    const entity = this.repo.create({
      ...dto,
      modifiedByUserId: user.userId,
    });

    return this.repo.save(entity);
  }

  override async updateWithUserContext(
    id: string,
    dto: UpdateOrderItem,
    user: AuthUser,
  ): Promise<OrderItem> {
    const existing = await this.findOne(id, user.companyId);
    if (!existing)
      throw new ForbiddenException('Order item not found or access denied');

    const updated = Object.assign(existing, {
      ...dto,
      modifiedByUserId: user.userId,
    });

    await this.runAllValidations(updated, user.companyId);
    return this.repo.save(updated);
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

    const [order, product] = await Promise.all([
      this.orderService.findOne(dto.orderId, companyId),
      this.productService.findOne(dto.productId, companyId),
    ]);

    if (!order) throw new UserInputError('Order not found');
    if (!product) throw new UserInputError('Product not found');

    const warehouse = await this.warehouseService.findOne(
      order.warehouseId,
      companyId,
    );
    if (!warehouse) throw new UserInputError('Warehouse not found');

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

    const order = await this.orderService.findOne(dto.orderId, companyId);
    if (!order) throw new UserInputError('Order not found');
    if (order.orderType !== OrderTypeEnum.SHIPMENT) return;

    const orderItems = await this.repo
      .createQueryBuilder('orderItem')
      .innerJoin('orders', 'o', 'o.id = orderItem.orderId')
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

      const itemOrder = await this.orderService.findOne(
        item.orderId,
        companyId,
      );
      if (!itemOrder) continue;

      availableStock +=
        itemOrder.orderType === OrderTypeEnum.DELIVERY
          ? item.quantity
          : -item.quantity;
    }

    if (availableStock < dto.quantity) {
      throw new ApolloError(
        `Insufficient stock: Available ${availableStock}, Requested ${dto.quantity}`,
        'INSUFFICIENT_STOCK',
      );
    }
  }
}
