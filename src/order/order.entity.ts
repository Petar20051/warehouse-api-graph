import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { OrderTypeEnum } from './order.static';

@Entity({ name: 'orders' })
export class Order extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId!: string;

  @Column({ type: 'uuid', nullable: true })
  partnerId!: string;

  @Column({ type: 'uuid' })
  warehouseId!: string;

  @Column({
    type: 'enum',
    enum: OrderTypeEnum,
    enumName: 'order_type_enum',
  })
  orderType!: OrderTypeEnum;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;
}
