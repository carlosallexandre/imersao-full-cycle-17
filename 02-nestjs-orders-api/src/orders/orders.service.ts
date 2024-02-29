import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private amqpConnection: AmqpConnection,
  ) {}

  async create(createOrderDto: CreateOrderDto & { client_id: number }) {
    const productIds = createOrderDto.items.map((item) => item.product_id);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await this.productsRepository.findBy({
      id: In(uniqueProductIds),
    });

    if (products.length !== uniqueProductIds.length) {
      throw new Error(
        `Algum produto não encontrado. 
        Produtos passados: ${uniqueProductIds.join(', ')}. 
        Produtos encontrados: ${products.map((item) => item.id).join(', ')}`,
      );
    }

    const order = Order.create({
      client_id: createOrderDto.client_id,
      items: createOrderDto.items.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        return {
          price: product.price,
          quantity: item.quantity,
          product_id: item.product_id,
        };
      }),
    });

    await this.ordersRepository.save(order);
    await this.amqpConnection.publish('amq.direct', 'OrderCreated', {
      order_id: order.id,
      card_hash: createOrderDto.card_hash,
      total: order.total,
    });

    return order;
  }

  findAll(client_id: number) {
    console.log(client_id);
    return this.ordersRepository.findBy({ client_id });
  }

  findOne(id: string, client_id: number) {
    return this.ordersRepository.findOneByOrFail({
      id,
      client_id,
    });
  }
}
