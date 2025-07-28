import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  CreateProductDto,
  createProductSchema,
  UpdateProductDto,
  updateProductSchema,
} from './product.static';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';
import { User } from 'src/auth/decorators/user.decorator';
import { AuthUser } from 'src/common/types/auth-user';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../user/user.static';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { BaseController } from 'src/common/controller/base.controller';

@ApiTags('Products')
@ApiBearerAuth('Authorization')
@Controller('products')
export class ProductController extends BaseController<Product> {
  constructor(private readonly productService: ProductService) {
    super(productService);
  }

  @CustomMessage('Best-selling products retrieved successfully')
  @Get('/best-selling')
  @ApiOperation({ summary: 'Get best-selling products' })
  getBestSellingProducts(@User('companyId') companyId: string) {
    return this.productService.getBestSellingProducts(companyId);
  }

  @CustomMessage('Products retrieved successfully')
  @Get()
  @ApiOperation({ summary: "Get all products for the current user's company" })
  findAll(@User() user: AuthUser) {
    return super.findAll(user);
  }

  @CustomMessage('Product retrieved successfully')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }

  @CustomMessage('Product created successfully')
  @Post()
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      minimal: { value: { name: '', sku: '', productType: '', basePrice: 0 } },
    },
  })
  create(
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
    @User() user: AuthUser,
  ) {
    return super.create(dto, user);
  }

  @CustomMessage('Product updated successfully')
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({
    type: UpdateProductDto,
    examples: {
      empty: { value: { name: '', sku: '', productType: '', basePrice: 0 } },
    },
  })
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
    @User() user: AuthUser,
  ) {
    return this.productService.updateWithSkuCheck(params.id, dto, user);
  }

  @CustomMessage('Product soft-deleted successfully')
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Soft delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.softDelete(params, user);
  }

  @CustomMessage('Product permanently deleted')
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Permanently delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }
}
