import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class CompanyService extends BaseService<Company> {
  constructor(@InjectRepository(Company) repo: Repository<Company>) {
    super(repo);
  }

  findOneById(id: string): Promise<Company | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Company>): Promise<Company> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Company>): Promise<void> {
    await this.repo.update(id, data);
  }
}
