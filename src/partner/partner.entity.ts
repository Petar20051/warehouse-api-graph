import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

export type PartnerType = 'customer' | 'supplier';

@Entity('partner')
export class Partner extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: ['customer', 'supplier'] })
  type!: PartnerType;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;
}
