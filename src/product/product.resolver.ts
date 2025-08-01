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

import { BestSellingProductType, ProductType } from './product.types';
import { Product } from './product.entity';
import { ProductService } from './product.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { OrderItemService } from 'src/orderItem/orderItem.service';
import { OrderItem } from 'src/orderItem/orderItem.entity';
import { OrderItemType } from 'src/orderItem/orderItem.types';
import { idParamSchema } from 'src/common/types/id-param.static';
import { CreateProductInput, UpdateProductInput } from './product.inputs';
import { createProductSchema, updateProductSchema } from './product.static';
import { UserRole } from 'src/user/user.static';

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
  override findAll(@CurrentUser('companyId') companyId: string) {
    return super.findAll(companyId);
  }

  @Query(() => ProductType, { name: 'getProductById', nullable: true })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.findOne(id, companyId);
  }

  @Query(() => [BestSellingProductType], {
    name: 'getBestSellingProducts',
    description:
      'Returns best-selling products for a company, based on shipment order quantities.',
  })
  getBestSellingProducts(@CurrentUser('companyId') companyId: string) {
    return this.productService.getBestSellingProducts(companyId);
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
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }

  @ResolveField(() => [OrderItemType], { nullable: 'itemsAndList' })
  orderItems(@Parent() product: Product): Promise<OrderItem[]> {
    return this.orderItemService.findByProduct(product.id);
  }
}
