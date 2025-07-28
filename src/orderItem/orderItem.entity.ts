import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity({ name: 'order_item' })
@Unique('unique_order_product', ['orderId', 'productId'])
export class OrderItem extends BaseEntity {
  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'uuid' })
  productId!: string;
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'numeric' })
  quantity!: number;
}
