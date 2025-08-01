import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { BaseService } from 'src/common/services/base.service';
import { UserRole } from './user.static';
import { AuthUser } from 'src/common/types/auth-user';
import { MessagePayload } from 'src/auth/auth.types';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) repo: Repository<User>) {
    super(repo);
  }

  async countOwners(companyId: string): Promise<number> {
    return this.repo.count({
      where: { companyId, role: UserRole.OWNER },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  findOneByIdAndCompany(id: string, companyId: string): Promise<User | null> {
    return this.repo.findOne({ where: { id, companyId } });
  }

  create(data: Partial<User>): Promise<User> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.repo.update(id, data);
  }

  override async softDelete(
    id: string,
    user: AuthUser,
  ): Promise<MessagePayload> {
    const target = await this.findOne(id, user.companyId);
    if (!target) {
      return { message: 'User not found' };
    }
    if (target.role === UserRole.OWNER) {
      const ownerCount = await this.countOwners(user.companyId);
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot delete the last OWNER');
      }
    }

    await super.softDelete(id, user);
    return { message: 'User soft deleted successfully' };
  }

  override async hardDelete(
    id: string,
    companyId: string,
  ): Promise<MessagePayload> {
    const target = await this.findOne(id, companyId);
    if (!target) {
      return { message: 'User not found' };
    }
    if (target.role === UserRole.OWNER) {
      const ownerCount = await this.countOwners(companyId);
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot delete the last OWNER');
      }
    }

    await super.hardDelete(id, companyId);
    return { message: 'User permanently deleted' };
  }
}
