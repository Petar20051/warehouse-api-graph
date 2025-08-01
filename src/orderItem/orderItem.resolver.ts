import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
  Float,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import {
  OrderItemType,
  createOrderItemSchema,
  updateOrderItemSchema,
} from './orderItem.types';
import { OrderItem } from './orderItem.entity';
import { OrderItemService } from './orderItem.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/user.static';

import { OrderService } from 'src/order/order.service';
import { ProductService } from 'src/product/product.service';
import { OrderType } from 'src/order/order.types';
import { ProductType } from 'src/product/product.types';

import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';
import { CreateOrderItemInput, UpdateOrderItemInput } from './orderItem.inputs';

@Resolver(() => OrderItemType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderItemResolver extends BaseResolver<
  OrderItem,
  CreateOrderItemInput,
  UpdateOrderItemInput
> {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {
    super(orderItemService);
  }

  @Query(() => [OrderItemType], { name: 'getAllOrderItems' })
  override findAll(@CurrentUser('companyId') companyId: string) {
    return super.findAll(companyId);
  }

  @Query(() => OrderItemType, { name: 'getOrderItemById', nullable: true })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.findOne(id, companyId);
  }

  @Mutation(() => OrderItemType, { name: 'createOrderItem' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override create(
    @Args('input', new ZodValidationPipe(createOrderItemSchema))
    input: CreateOrderItemInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => OrderItemType, { name: 'updateOrderItem' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updateOrderItemSchema))
    input: UpdateOrderItemInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeleteOrderItem' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeleteOrderItem' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }

  @ResolveField(() => OrderType)
  order(
    @Parent() item: OrderItem,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.orderService.findOne(item.orderId, companyId);
  }

  @ResolveField(() => ProductType)
  product(
    @Parent() item: OrderItem,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.productService.findOne(item.productId, companyId);
  }

  @ResolveField(() => Float)
  async total(
    @Parent() item: OrderItem,
    @CurrentUser('companyId') companyId: string,
  ): Promise<number | undefined> {
    return await this.orderItemService.findTotalForCurrentItem(
      item.id,
      companyId,
    );
  }
}
