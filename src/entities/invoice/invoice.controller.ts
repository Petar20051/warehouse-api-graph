import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';
import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import {
  CreateInvoiceDto,
  createInvoiceSchema,
  UpdateInvoiceDto,
  updateInvoiceSchema,
} from './invoice.static';
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

@ApiTags('Invoices')
@ApiBearerAuth('Authorization')
@Controller('invoices')
export class InvoiceController extends BaseController<
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto
> {
  constructor(private readonly invoiceService: InvoiceService) {
    super(invoiceService);
  }

  @CustomMessage('Invoices retrieved successfully')
  @Get()
  @ApiOperation({ summary: "Get all invoices for the current user's company" })
  findAll(@User() user: AuthUser) {
    return super.findAll(user);
  }

  @CustomMessage('Invoice retrieved successfully')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }

  @CustomMessage('Invoice created successfully')
  @Post()
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({
    type: CreateInvoiceDto,
    description: 'Fields required to create an invoice',
    examples: {
      minimal: {
        value: { orderId: '', invoiceNumber: '', status: '', date: '' },
      },
    },
  })
  create(
    @Body(new ZodValidationPipe(createInvoiceSchema)) dto: CreateInvoiceDto,
    @User() user: AuthUser,
  ) {
    return super.create(dto, user);
  }

  @CustomMessage('Invoice updated successfully')
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiBody({
    type: UpdateInvoiceDto,
    description: 'Fields to update an invoice',
    examples: {
      empty: {
        value: { orderId: '', invoiceNumber: '', status: '', date: '' },
      },
    },
  })
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body(new ZodValidationPipe(updateInvoiceSchema)) dto: UpdateInvoiceDto,
    @User() user: AuthUser,
  ) {
    return super.update(params, dto, user);
  }

  @CustomMessage('Invoice soft-deleted successfully')
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Soft delete an invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.softDelete(params, user);
  }

  @CustomMessage('Invoice permanently deleted')
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Permanently delete an invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }
}
