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
  ProductType,
  CreateProductInput,
  UpdateProductInput,
  createProductSchema,
  updateProductSchema,
} from './product.types';
import { Product } from './product.entity';
import { ProductService } from './product.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/user.types';

import { OrderItemService } from 'src/orderItem/orderItem.service';
import { OrderItemType } from 'src/orderItem/orderItem.types';
import { OrderItem } from 'src/orderItem/orderItem.entity';
import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';

@Resolver(() => ProductType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductResolver extends BaseResolver<
  Product,
  CreateProductInput,
  UpdateProductInput
> {
  constructor(
    private readonly productService: ProductService,
    private readonly orderItemService: OrderItemService,
  ) {
    super(productService);
  }

  @Query(() => [ProductType], { name: 'getAllProducts' })
  override findAll(@CurrentUser() user: AuthUser) {
    return super.findAll(user);
  }

  @Query(() => ProductType, { nullable: true, name: 'getProductById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.findOne(id, user);
  }

  @Mutation(() => ProductType, { name: 'createProduct' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override create(
    @Args('input', new ZodValidationPipe(createProductSchema))
    input: CreateProductInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => ProductType, { name: 'updateProduct' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updateProductSchema))
    input: UpdateProductInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeleteProduct' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeleteProduct' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.hardDelete(id, user);
  }

  @ResolveField(() => [OrderItemType], { nullable: 'itemsAndList' })
  orderItems(@Parent() product: Product): Promise<OrderItem[]> {
    return this.orderItemService.findByProduct(product.id);
  }
}
