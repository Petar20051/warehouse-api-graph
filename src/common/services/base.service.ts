import { ForbiddenException } from '@nestjs/common';
import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import { AuthUser } from '../types/auth-user';

function whereCompany<TEntity extends { companyId?: string }>(
  companyId: string,
): FindOptionsWhere<TEntity> {
  return { companyId } as FindOptionsWhere<TEntity>;
}

function whereId<TEntity extends { id: string }>(
  id: string,
): FindOptionsWhere<TEntity> {
  return { id } as FindOptionsWhere<TEntity>;
}

export class BaseService<
  TEntity extends { id: string; companyId?: string },
  TCreateDto = DeepPartial<TEntity>,
  TUpdateDto = DeepPartial<TEntity>,
> {
  constructor(protected readonly repo: Repository<TEntity>) {}

  async findAllByCompany(companyId: string): Promise<TEntity[]> {
    return this.repo.find({ where: whereCompany<TEntity>(companyId) });
  }

  async findOne(id: string, companyId: string): Promise<TEntity | null> {
    const entity = await this.repo.findOne({ where: whereId<TEntity>(id) });
    this.assertCompanyAccess(entity, companyId);
    return entity;
  }

  async createWithUserContext(
    data: TCreateDto,
    user: AuthUser,
  ): Promise<TEntity> {
    const entity = this.repo.create({
      ...data,
      companyId: user.companyId,
      modifiedByUserId: user.userId,
    } as DeepPartial<TEntity>);

    return this.repo.save(entity);
  }

  async updateWithUserContext(
    id: string,
    data: TUpdateDto,
    user: AuthUser,
  ): Promise<TEntity | null> {
    const entity = await this.repo.findOne({ where: whereId<TEntity>(id) });
    this.assertCompanyAccess(entity, user.companyId);

    const updated = this.repo.merge(entity!, {
      ...data,
      modifiedByUserId: user.userId,
    } as DeepPartial<TEntity>);

    return this.repo.save(updated);
  }

  async softDelete(id: string, user: AuthUser): Promise<void> {
    const entity = await this.repo.findOne({ where: whereId<TEntity>(id) });
    this.assertCompanyAccess(entity, user.companyId);

    const updated = this.repo.merge(entity!, {
      modifiedByUserId: user.userId,
    } as unknown as DeepPartial<TEntity>);

    await this.repo.save(updated);
    await this.repo.softDelete(id);
  }

  async hardDelete(id: string, companyId: string): Promise<void> {
    const entity = await this.repo.findOne({
      where: whereId<TEntity>(id),
      withDeleted: true,
    });

    this.assertCompanyAccess(entity, companyId);
    await this.repo.delete(id);
  }

  private assertCompanyAccess(
    entity: TEntity | null,
    expectedCompanyId: string,
  ) {
    if (!entity) {
      throw new ForbiddenException('Entity not found or access denied');
    }

    if (!('companyId' in entity)) {
      throw new ForbiddenException(
        'Entity is missing company context and cannot be verified',
      );
    }

    if (entity.companyId !== expectedCompanyId) {
      throw new ForbiddenException(
        'Access to resource from another company is denied',
      );
    }
  }
}
