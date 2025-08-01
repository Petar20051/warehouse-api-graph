import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { UserRole } from 'src/user/user.static';

import { OrderService } from './order.service';
import { OrderType } from './order.types';
import { Order } from './order.entity';

import { AuthUser } from 'src/common/types/auth-user';
import { idParamSchema } from 'src/common/types/id-param.static';
import { MessagePayload } from 'src/auth/auth.types';
import { BaseResolver } from 'src/common/resolvers/base.resolver';

import { WarehouseService } from 'src/warehouse/warehouse.service';
import { PartnerService } from 'src/partner/partner.service';
import { OrderItemService } from 'src/orderItem/orderItem.service';
import { InvoiceService } from 'src/invoice/invoice.service';

import { WarehouseType } from 'src/warehouse/warehouse.types';
import { PartnerType } from 'src/partner/partner.types';
import { OrderItemType } from 'src/orderItem/orderItem.types';
import { InvoiceType } from 'src/invoice/invoice.types';
import {
  CreateOrderInput,
  CreateOrderWithItemsInput,
  TransferProductInput,
  UpdateOrderInput,
} from './order.inputs';
import { createOrderSchema, updateOrderSchema } from './order.static';

@Resolver(() => OrderType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderResolver extends BaseResolver<
  Order,
  CreateOrderInput,
  UpdateOrderInput
> {
  constructor(
    private readonly orderService: OrderService,
    private readonly warehouseService: WarehouseService,
    private readonly partnerService: PartnerService,
    private readonly orderItemService: OrderItemService,
    private readonly invoiceService: InvoiceService,
  ) {
    super(orderService);
  }

  @Query(() => [OrderType], { name: 'getAllOrders' })
  override findAll(@CurrentUser('companyId') companyId: string) {
    return super.findAll(companyId);
  }

  @Query(() => OrderType, { name: 'getOrderById', nullable: true })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.findOne(id, companyId);
  }

  @Mutation(() => OrderType, { name: 'createOrder' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override create(
    @Args('input', new ZodValidationPipe(createOrderSchema))
    input: CreateOrderInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => OrderType, { name: 'updateOrder' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updateOrderSchema))
    input: UpdateOrderInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeleteOrder' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeleteOrder' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }

  @Mutation(() => MessagePayload, { name: 'transferProductBetweenWarehouses' })
  async transferProduct(
    @Args('input') input: TransferProductInput,
    @CurrentUser() user: AuthUser,
  ): Promise<MessagePayload> {
    const { productId, quantity, fromWarehouseId, toWarehouseId } = input;

    await this.orderService.transferProductBetweenWarehouses(
      productId,
      quantity,
      fromWarehouseId,
      toWarehouseId,
      user,
    );

    return { message: 'Product transfer completed successfully' };
  }

  @Mutation(() => OrderType, { name: 'createOrderWithItems' })
  async createOrderWithItems(
    @Args('input') input: CreateOrderWithItemsInput,
    @CurrentUser() user: AuthUser,
  ) {
    return this.orderService.createFullOrder(input, user);
  }

  @ResolveField(() => WarehouseType)
  warehouse(@Parent() order: Order) {
    return this.warehouseService.findOne(order.warehouseId, order.companyId);
  }

  @ResolveField(() => PartnerType, { nullable: true })
  partner(@Parent() order: Order) {
    return order.partnerId
      ? this.partnerService.findOne(order.partnerId, order.companyId)
      : null;
  }

  @ResolveField(() => [OrderItemType], { nullable: 'itemsAndList' })
  orderItems(@Parent() order: Order) {
    return this.orderItemService.findByOrder(order.id);
  }

  @ResolveField(() => InvoiceType, { nullable: true })
  invoice(@Parent() order: Order) {
    return this.invoiceService.findByOrderId(order.id);
  }
}
