import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderItem } from './orderItem.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { AuthUser } from 'src/common/types/auth-user';
import { BaseService } from 'src/common/services/base.service';
import { CreateOrderItemShape, UpdateOrderItemShape } from './orderItem.types';

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

  override async findAllByCompany(companyId: string): Promise<OrderItem[]> {
    return this.repo
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'o')
      .leftJoin('o.company', 'c')
      .where('c.id = :companyId', { companyId })
      .andWhere('orderItem.deletedAt IS NULL')
      .getMany();
  }

  override async findOne(
    id: string,
    companyId: string,
  ): Promise<OrderItem | null> {
    return this.findOneSecure(id, companyId);
  }

  override async createWithUserContext(
    dto: CreateOrderItemShape,
    user: AuthUser,
  ): Promise<OrderItem> {
    await this.runAllValidations(dto);

    const entity: Partial<OrderItem> = {
      unitPrice: dto.unitPrice,
      quantity: dto.quantity,
      order: { id: dto.orderId } as Order,
      product: { id: dto.productId } as Product,
      modifiedByUserId: user.userId,
    };

    return this.repo.save(this.repo.create(entity));
  }

  override async updateWithUserContext(
    id: string,
    dto: UpdateOrderItemShape,
    user: AuthUser,
  ): Promise<OrderItem | null> {
    const existing = await this.findOneSecure(id, user.companyId);
    if (!existing)
      throw new ForbiddenException('Order item not found or access denied');

    const updated: Partial<OrderItem> = {
      ...existing,
      ...dto,
      modifiedByUserId: user.userId,
    };

    await this.runAllValidations(updated);
    Object.assign(existing, updated);
    return this.repo.save(existing);
  }

  override async softDelete(id: string, user: AuthUser): Promise<void> {
    const item = await this.findOneSecure(id, user.companyId);
    if (!item)
      throw new ForbiddenException('Order item not found or access denied');

    await this.repo.softDelete({ id });
  }

  override async hardDelete(id: string, companyId: string): Promise<void> {
    const item = await this.findOneSecure(id, companyId);
    if (!item)
      throw new ForbiddenException('Order item not found or access denied');

    await this.repo.delete({ id });
  }

  private async runAllValidations(dto: Partial<CreateOrderItemShape>) {
    await this.validateWarehouseSupportsProductType(dto);
    await this.validateOrderProductCompanyMatch(dto);
    await this.validateShipmentStockAvailability(dto);
  }

  private async validateWarehouseSupportsProductType(
    dto: Partial<CreateOrderItemShape>,
  ) {
    if (!dto.orderId || !dto.productId) return;

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['warehouse'],
    });
    if (!order) throw new BadRequestException('Order not found');
    if (!order.warehouse) throw new BadRequestException('Warehouse not found');

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new BadRequestException('Product not found');

    const warehouse = order.warehouse;
    if (warehouse.supportedType !== product.productType) {
      throw new BadRequestException(
        `Incompatible types: cannot store ${product.productType} product in ${warehouse.supportedType} warehouse`,
      );
    }
  }

  private async validateOrderProductCompanyMatch(
    dto: Partial<CreateOrderItemShape>,
  ) {
    if (!dto.orderId || !dto.productId) return;

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['company'],
    });
    if (!order) throw new BadRequestException('Order not found');
    if (!order.company)
      throw new BadRequestException('Order company not found');

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
      relations: ['company'],
    });
    if (!product) throw new BadRequestException('Product not found');
    if (!product.company)
      throw new BadRequestException('Product company not found');

    if (order.company.id !== product.company.id) {
      throw new BadRequestException(
        'Order and product must belong to the same company',
      );
    }
  }

  private async validateShipmentStockAvailability(
    dto: Partial<CreateOrderItemShape>,
  ) {
    if (!dto.orderId || !dto.productId || typeof dto.quantity !== 'number')
      return;

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['warehouse'],
    });
    if (!order) throw new BadRequestException('Order not found');
    if (!order.warehouse) throw new BadRequestException('Warehouse not found');

    if (order.orderType !== 'shipment') return;

    const orderItems = await this.repo
      .createQueryBuilder('orderItem')
      .innerJoinAndSelect('orderItem.order', 'o')
      .where('orderItem.productId = :productId', { productId: dto.productId })
      .andWhere('o.warehouse_id = :warehouseId', {
        warehouseId: order.warehouse.id,
      })
      .andWhere('orderItem.deletedAt IS NULL')
      .andWhere('o.deletedAt IS NULL')
      .getMany();

    let availableStock = 0;
    for (const item of orderItems) {
      if (item.order.orderType === 'delivery') {
        availableStock += item.quantity;
      } else if (item.order.orderType === 'shipment') {
        availableStock -= item.quantity;
      }
    }

    if (availableStock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock: Available ${availableStock}, Attempted shipment ${dto.quantity}`,
      );
    }
  }

  private async findOneSecure(
    id: string,
    companyId: string,
  ): Promise<OrderItem | null> {
    return this.repo.findOne({
      where: {
        id,
        order: {
          company: { id: companyId },
        },
      },
      relations: ['order', 'order.company'],
    });
  }
}
