import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from '../order/order.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from '../user/user.entity';

export enum InvoiceStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity({ name: 'invoice' })
export class Invoice extends BaseEntity {
  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoiceNumber!: string;

  @OneToOne(() => Order, (order) => order.invoice)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
  })
  status!: InvoiceStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modified_by_user_id' })
  modifiedBy?: User;
}
