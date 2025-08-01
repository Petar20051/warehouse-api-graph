import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompanyType } from './company.types';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/user.static';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { UserService } from 'src/user/user.service';
import { ProductService } from 'src/product/product.service';
import { WarehouseService } from 'src/warehouse/warehouse.service';
import { PartnerService } from 'src/partner/partner.service';
import { OrderService } from 'src/order/order.service';

import { UserType } from 'src/user/user.types';
import { ProductType } from 'src/product/product.types';
import { WarehouseType } from 'src/warehouse/warehouse.types';
import { PartnerType } from 'src/partner/partner.types';
import { OrderType } from 'src/order/order.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';
import { CreateCompanyInput, UpdateCompanyInput } from './company.inputs';
import { createCompanySchema, updateCompanySchema } from './company.static';

@Resolver(() => CompanyType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyResolver extends BaseResolver<
  Company,
  CreateCompanyInput,
  UpdateCompanyInput
> {
  constructor(
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly warehouseService: WarehouseService,
    private readonly partnerService: PartnerService,
    private readonly orderService: OrderService,
  ) {
    super(companyService);
  }

  @Query(() => CompanyType, { nullable: true, name: 'getCompanyInfo' })
  async getCompanyInfo(@CurrentUser('companyId') companyId: string) {
    return this.companyService.findOneById(companyId);
  }

  @Mutation(() => CompanyType, { name: 'createCompany' })
  @Roles(UserRole.OWNER)
  override create(
    @Args('input', new ZodValidationPipe(createCompanySchema))
    input: CreateCompanyInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => CompanyType, { name: 'updateCompany' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updateCompanySchema))
    input: UpdateCompanyInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeleteCompany' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeleteCompany' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }

  @ResolveField(() => [UserType], { nullable: 'itemsAndList' })
  users(@Parent() company: Company) {
    return this.userService.findAllByCompany(company.id);
  }

  @ResolveField(() => [ProductType], { nullable: 'itemsAndList' })
  products(@Parent() company: Company) {
    return this.productService.findAllByCompany(company.id);
  }

  @ResolveField(() => [WarehouseType], { nullable: 'itemsAndList' })
  warehouses(@Parent() company: Company) {
    return this.warehouseService.findAllByCompany(company.id);
  }

  @ResolveField(() => [PartnerType], { nullable: 'itemsAndList' })
  partners(@Parent() company: Company) {
    return this.partnerService.findAllByCompany(company.id);
  }

  @ResolveField(() => [OrderType], { nullable: 'itemsAndList' })
  orders(@Parent() company: Company) {
    return this.orderService.findAllByCompany(company.id);
  }
}
