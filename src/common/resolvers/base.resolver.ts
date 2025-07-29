import { BaseService } from '../services/base.service';
import { DeepPartial } from 'typeorm';
import { AuthUser } from '../types/auth-user';

export abstract class BaseResolver<
  T extends { id: string; companyId?: string },
  CreateDto extends DeepPartial<T> = DeepPartial<T>,
  UpdateDto extends DeepPartial<T> = DeepPartial<T>,
> {
  constructor(protected readonly service: BaseService<T>) {}

  async findAll(user: AuthUser): Promise<T[]> {
    return this.service.findAllByCompany(user.companyId);
  }

  async findOne(id: string, user: AuthUser): Promise<T | null> {
    return this.service.findOne(id, user.companyId);
  }

  async create(dto: CreateDto, user: AuthUser): Promise<T> {
    return this.service.createWithUserContext(dto, user);
  }

  async update(id: string, dto: UpdateDto, user: AuthUser): Promise<T | null> {
    return this.service.updateWithUserContext(id, dto, user);
  }

  async softDelete(id: string, user: AuthUser): Promise<void> {
    return this.service.softDelete(id, user);
  }

  async hardDelete(id: string, user: AuthUser): Promise<void> {
    return this.service.hardDelete(id, user.companyId);
  }
}
