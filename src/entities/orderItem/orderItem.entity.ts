import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'order_item' })
@Unique('unique_order_product', ['orderId', 'productId'])
export class OrderItem extends BaseEntity {
  @Column({ type: 'uuid' })
  orderId!: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal' })
  quantity!: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by_user_id' })
  modifiedBy?: User;
}
