import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import {
  OrderType,
  CreateOrderInput,
  UpdateOrderInput,
  createOrderSchema,
  updateOrderSchema,
} from './order.types';
import { Order } from './order.entity';
import { OrderService } from './order.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/user.types';

import { WarehouseService } from 'src/warehouse/warehouse.service';
import { PartnerService } from 'src/partner/partner.service';
import { OrderItemService } from 'src/orderItem/orderItem.service';
import { InvoiceService } from 'src/invoice/invoice.service';

import { WarehouseType } from 'src/warehouse/warehouse.types';
import { PartnerType } from 'src/partner/partner.types';
import { OrderItemType } from 'src/orderItem/orderItem.types';
import { InvoiceType } from 'src/invoice/invoice.types';

import { Invoice } from 'src/invoice/invoice.entity';
import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';

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
  override findAll(@CurrentUser() user: AuthUser) {
    return super.findAll(user);
  }

  @Query(() => OrderType, { nullable: true, name: 'getOrderById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.findOne(id, user);
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
    @CurrentUser() user: AuthUser,
  ) {
    return super.hardDelete(id, user);
  }

  @ResolveField(() => WarehouseType)
  warehouse(@Parent() order: Order) {
    return this.warehouseService.findOne(order.warehouseId, order.companyId);
  }

  @ResolveField(() => PartnerType, { nullable: true })
  partner(@Parent() order: Order) {
    if (!order.partnerId) return null;
    return this.partnerService.findOne(order.partnerId, order.companyId);
  }

  @ResolveField(() => [OrderItemType], { nullable: 'itemsAndList' })
  orderItems(@Parent() order: Order) {
    return this.orderItemService.findByOrder(order.id);
  }

  @ResolveField(() => InvoiceType, { nullable: true })
  async invoice(@Parent() order: Order): Promise<Invoice | null> {
    return this.invoiceService.findByOrderId(order.id);
  }
}
