import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

export type ProductType = 'solid' | 'liquid';

@Entity('warehouse')
export class Warehouse extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text' })
  location!: string;

  @Column({ name: 'supported_type', type: 'enum', enum: ['solid', 'liquid'] })
  supportedType!: ProductType;
}
