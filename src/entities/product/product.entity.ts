import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { Company } from '../company/company.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { OrderItem } from '../orderItem/orderItem.entity';
import { User } from '../user/user.entity';

export type ProductType = 'solid' | 'liquid';

@Entity('product')
export class Product extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 50, unique: true })
  sku!: string;

  @Column({ name: 'product_type', type: 'enum', enum: ['solid', 'liquid'] })
  productType!: ProductType;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
  basePrice!: number;

  @ManyToOne(() => Company, (company) => company.products)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems!: OrderItem[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by_user_id' })
  modifiedBy?: User;
}
