import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Warehouse } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';
import {
  CreateWarehouseDto,
  createWarehouseSchema,
  UpdateWarehouseDto,
  updateWarehouseSchema,
} from './warehouse.static';
import { ZodValidationPipe } from 'nestjs-zod';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';
import { User } from 'src/auth/decorators/user.decorator';
import { AuthUser } from 'src/common/types/auth-user';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../user/user.static';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { BaseController } from 'src/common/controller/base.controller';

@ApiTags('Warehouses')
@ApiBearerAuth('Authorization')
@Controller('warehouses')
export class WarehouseController extends BaseController<Warehouse> {
  constructor(private readonly warehouseService: WarehouseService) {
    super(warehouseService);
  }

  @CustomMessage('Warehouse top stock data retrieved successfully')
  @Get('top-stock')
  @ApiOperation({ summary: 'Get product with highest stock per warehouse' })
  getProductWithHighestStock(@User() user: AuthUser) {
    return this.warehouseService.getProductWithHighestStock(user.companyId);
  }

  @CustomMessage('Warehouses retrieved successfully')
  @Get()
  @ApiOperation({
    summary: "Get all warehouses for the current user's company",
  })
  findAll(@User() user: AuthUser) {
    return super.findAll(user);
  }

  @CustomMessage('Warehouse retrieved successfully')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }

  @CustomMessage('Warehouse created successfully')
  @Post()
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiBody({
    type: CreateWarehouseDto,
    description: 'Fields required to create a warehouse',
    examples: {
      minimal: { value: { name: '', location: '', supportedType: '' } },
    },
  })
  create(
    @Body(new ZodValidationPipe(createWarehouseSchema)) dto: CreateWarehouseDto,
    @User() user: AuthUser,
  ) {
    return super.create(dto, user);
  }

  @CustomMessage('Warehouse updated successfully')
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update a warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiBody({
    type: UpdateWarehouseDto,
    description: 'Fields to update an existing warehouse',
    examples: {
      empty: { value: { name: '', location: '', supportedType: '' } },
    },
  })
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body(new ZodValidationPipe(updateWarehouseSchema)) dto: UpdateWarehouseDto,
    @User() user: AuthUser,
  ) {
    return super.update(params, dto, user);
  }

  @CustomMessage('Warehouse soft-deleted successfully')
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Soft delete a warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.softDelete(params, user);
  }

  @CustomMessage('Warehouse permanently deleted')
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Permanently delete a warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }
}
