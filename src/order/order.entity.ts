import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

export type OrderType = 'shipment' | 'delivery';

@Entity({ name: 'orders' })
export class Order extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId!: string;

  @Column({ type: 'uuid', nullable: true })
  partnerId!: string;

  @Column({ type: 'uuid' })
  warehouseId!: string;

  @Column({ type: 'enum', enum: ['shipment', 'delivery'] })
  orderType!: OrderType;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;
}
