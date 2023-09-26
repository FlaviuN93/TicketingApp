import {
  Listener,
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@fntickets30/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = 'payments-service'

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    })
    await order.save()

    msg.ack()
  }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  queueGroupName = 'payments-service'

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    })
    if (!order) throw new Error('Order not found')
    order.set({ status: OrderStatus.Cancelled })
    await order.save()
    msg.ack()
  }
}
