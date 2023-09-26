import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import {
  OrderCancelledListener,
  OrderCreatedListener,
} from '../payments-listener'
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from '@fntickets30/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'

const orderCreatedSetup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'dfkspfodskfpo',
    status: OrderStatus.Created,
    expiresAt: 'fdskfpokdsfo',
    ticket: {
      id: 'dsfklopdsfk',
      price: 20,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}
const orderCancelledSetup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'fdsfkdpofs',
    version: 0,
    price: 10,
  })

  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: 'dsfklopdsfk',
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('replicates the order info', async () => {
  const { listener, data, msg } = await orderCreatedSetup()
  await listener.onMessage(data, msg)
  const order = await Order.findById(data.id)
  expect(order!.price).toEqual(data.ticket.price)
})
it('acks the message', async () => {
  const { listener, data, msg } = await orderCreatedSetup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})

it('updates the status of the order', async () => {
  const { listener, data, msg } = await orderCancelledSetup()
  await listener.onMessage(data, msg)
  const updatedOrder = await Order.findById(data.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})
it('acks the message', async () => {
  const { listener, data, msg } = await orderCancelledSetup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})
