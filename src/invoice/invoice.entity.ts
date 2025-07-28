import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

export enum InvoiceStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity({ name: 'invoice' })
export class Invoice extends BaseEntity {
  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoiceNumber!: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
  })
  status!: InvoiceStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;
}
