import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from '../company/company.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';

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

  @ManyToOne(() => Company, (company) => company.partners)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @OneToMany(() => Order, (order) => order.partner)
  orders!: Order[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by_user_id' })
  modifiedBy?: User;
}
