import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from '@fntickets30/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledListener } from '../order-cancelled-listener'

const orderCreatedSetup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asfddslfpdfs',
  })
  await ticket.save()

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'fdsfdsfsfsd',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  // Create the fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

const orderCancelledSetup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = new mongoose.Types.ObjectId().toHexString()

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asfddslfpdfs',
  })
  ticket.set({ orderId })
  await ticket.save()

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }

  // Create the fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, orderId, ticket, data, msg }
}

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await orderCreatedSetup()
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const { listener, data, msg } = await orderCreatedSetup()
  await listener.onMessage(data, msg)
  expect(msg.ack()).toHaveBeenCalled()
})

it('publishes a ticket update event', async () => {
  const { listener, data, msg } = await orderCreatedSetup()
  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )
  expect(data.id).toEqual(ticketUpdatedData.orderId)
})

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { msg, data, ticket, listener } = await orderCancelledSetup()
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).not.toBeDefined()
  expect(msg.ack()).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
