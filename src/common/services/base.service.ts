import { ForbiddenException } from '@nestjs/common';
import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import { AuthUser } from '../types/auth-user';

export class BaseService<
  TEntity extends { id: string; companyId?: string },
  TCreateDto = DeepPartial<TEntity>,
  TUpdateDto = DeepPartial<TEntity>,
> {
  constructor(protected readonly repo: Repository<TEntity>) {}

  async findAllByCompany(companyId: string): Promise<TEntity[]> {
    return this.repo.find({
      where: { companyId } as FindOptionsWhere<TEntity>,
    });
  }

  async findOne(id: string, companyId: string): Promise<TEntity | null> {
    const entity = await this.repo.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });

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
    const entity = await this.repo.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });

    const checkedEntity = this.assertCompanyAccess(entity, user.companyId);

    const updated = this.repo.merge(checkedEntity, {
      ...data,
      modifiedByUserId: user.userId,
    } as DeepPartial<TEntity>);

    return this.repo.save(updated);
  }

  async softDelete(id: string, user: AuthUser): Promise<void> {
    const entity = await this.repo.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });

    const checkedEntity = this.assertCompanyAccess(entity, user.companyId);

    this.repo.merge(checkedEntity, {
      modifiedByUserId: user.userId,
    } as unknown as DeepPartial<TEntity>);

    await this.repo.save(checkedEntity);
    await this.repo.softDelete(id);
  }

  async hardDelete(id: string, companyId: string): Promise<void> {
    const entity = await this.repo.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
      withDeleted: true,
    });

    this.assertCompanyAccess(entity, companyId);
    await this.repo.delete(id);
  }

  private assertCompanyAccess(
    entity: TEntity | null,
    expectedCompanyId: string,
  ): TEntity {
    if (!entity) {
      throw new ForbiddenException('Entity not found or access denied');
    }

    if (
      typeof entity.companyId === 'undefined' ||
      entity.companyId !== expectedCompanyId
    ) {
      throw new ForbiddenException(
        'Access to resource from another company is denied',
      );
    }

    return entity;
  }
}
