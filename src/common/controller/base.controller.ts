import { Param, Body, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { BaseService } from '../services/base.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdParamDto, idParamSchema } from '../types/id-param.static';
import { ZodValidationPipe } from 'nestjs-zod';
import { User } from 'src/auth/decorators/user.decorator';
import { AuthUser } from '../types/auth-user';

@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BaseController<
  T extends { id: string; companyId?: string },
  CreateDto extends DeepPartial<T> = DeepPartial<T>,
  UpdateDto extends DeepPartial<T> = DeepPartial<T>,
> {
  constructor(protected readonly service: BaseService<T>) {}

  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAllByCompany(user.companyId);
  }

  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.findOne(params.id, user.companyId);
  }

  create(@Body() dto: CreateDto, @CurrentUser() user: AuthUser) {
    return this.service.createWithUserContext(dto, user);
  }

  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body() dto: UpdateDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateWithUserContext(params.id, dto, user);
  }

  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.softDelete(params.id, user);
  }

  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.hardDelete(params.id, user.companyId);
  }
}
