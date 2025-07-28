import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { Product } from '../product/product.entity';
import { Partner } from '../partner/partner.entity';
import { Order } from '../order/order.entity';

@Entity('company')
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @OneToMany(() => User, (user) => user.company)
  users!: User[];

  @OneToMany(() => Warehouse, (warehouse) => warehouse.company)
  warehouses!: Warehouse[];

  @OneToMany(() => Product, (product) => product.company)
  products!: Product[];

  @OneToMany(() => Partner, (partner) => partner.company)
  partners!: Partner[];

  @OneToMany(() => Order, (order) => order.company)
  orders!: Order[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by_user_id' })
  modifiedBy?: User;
}
