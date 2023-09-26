import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@fntickets30/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCancelledPublisher } from './order-publisher'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = 'orders-service'

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data
    const ticket = Ticket.build({ id, title, price })
    await ticket.save()
    msg.ack()
  }
}

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = 'orders-service'

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data)

    if (!ticket) throw new Error('Ticket not found')
    const { title, price } = data
    ticket.set({ title, price })
    await ticket.save()
    msg.ack()
  }
}

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
  queueGroupName = 'expiration-service'
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket')

    if (!order) throw new Error('Order not found')
    if (order.status === OrderStatus.Complete) return msg.ack()
    order.set({ status: OrderStatus.Cancelled })

    await order.save()

    new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id },
    })
    msg.ack()
  }
}

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
  queueGroupName = 'orders-service'
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId)
    if (!order) throw new Error('Order not found')
    order.set({ status: OrderStatus.Complete })
    await order.save()
    msg.ack()
  }
}
