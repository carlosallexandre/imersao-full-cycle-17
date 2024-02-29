import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column()
  client_id: number;

  @Column({
    type: 'simple-enum',
    enum: [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.FAILED],
  })
  status: OrderStatus = OrderStatus.PENDING;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
  items: OrderItem[];

  static create(input: {
    client_id: number;
    items: Array<{
      price: number;
      quantity: number;
      product_id: string;
    }>;
  }) {
    const order = new Order();
    order.client_id = input.client_id;
    order.items = input.items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.price = item.price;
      orderItem.quantity = item.quantity;
      orderItem.product_id = item.product_id;
      return orderItem;
    });

    order.total = order.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    return order;
  }
}
