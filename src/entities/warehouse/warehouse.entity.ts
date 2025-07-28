import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from '../company/company.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';

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

  @ManyToOne(() => Company, (company) => company.warehouses)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @OneToMany(() => Order, (order) => order.warehouse)
  orders!: Order[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by_user_id' })
  modifiedBy?: User;
}
