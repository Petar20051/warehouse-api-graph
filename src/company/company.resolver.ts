import { Controller, Post, Delete, Body, Param, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { BaseController } from 'src/common/controller/base.controller';
import {
  CreateCompanyDto,
  createCompanySchema,
  UpdateCompanyDto,
  updateCompanySchema,
} from './company.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';

import { AuthUser } from 'src/common/types/auth-user';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../user/user.types';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@ApiTags('Companies')
@ApiBearerAuth('Authorization')
@Controller('companies')
export class CompanyResolver extends BaseController<Company> {
  constructor(private readonly companyService: CompanyService) {
    super(companyService);
  }

  /*@Get()
  @ApiOperation({
    summary: "Get all companies for the current user's companyId",
  })
  findAll(@CurrentUser() user: AuthUser) {
    return super.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single company by ID' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }*/

  @CustomMessage('Company created successfully')
  @Post()
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Fields required to create a new company',
    examples: {
      minimal: { value: { name: '', email: '' } },
    },
  })
  create(
    @Body(new ZodValidationPipe(createCompanySchema)) dto: CreateCompanyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(dto, user);
  }

  @CustomMessage('Company updated successfully')
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update a company by ID' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiBody({
    type: UpdateCompanyDto,
    description: 'Fields to update an existing company',
    examples: {
      empty: { value: { name: '', email: '' } },
    },
  })
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body(new ZodValidationPipe(updateCompanySchema)) dto: UpdateCompanyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(params, dto, user);
  }

  @CustomMessage('Company soft-deleted successfully')
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Soft delete a company by ID (marks as deleted)' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(params, user);
  }

  @CustomMessage('Company permanently deleted')
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Permanently delete a company by ID (cannot be undone)',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }
}
