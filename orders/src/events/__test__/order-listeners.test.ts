import {
  ExpirationCompleteEvent,
  OrderStatus,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@fntickets30/common'
import { natsWrapper } from '../../nats-wrapper'
import {
  ExpirationCompleteListener,
  TicketCreatedListener,
  TicketUpdatedListener,
} from '../order-listeners'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { Order } from '../../models/order'

const ticketCreatedSetup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)
  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 300,
    title: 'concert',
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = { ack: jest.fn() }
  return { listener, data, msg }
}

const ticketUpdatedSetup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)
  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 2000,
    title: 'concert',
  })
  await ticket.save()
  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'movie',
    price: 25,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }
  // Create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  // return all
  return { listener, ticket, data, msg }
}

const expirationCompleteSetup = async () => {
  // create a listener
  const listener = new ExpirationCompleteListener(natsWrapper.client)
  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 2000,
    title: 'concert',
  })
  await ticket.save()

  const order = Order.build({
    userId: 'dsadadas',
    status: OrderStatus.Cancelled,
    expiresAt: new Date(),
    ticket,
  })

  await order.save()
  // Create a fake data object
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }
  // Create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  // return all
  return { listener, ticket, data, msg, order }
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await ticketCreatedSetup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)
  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
})
it('acks the message', async () => {
  const { listener, data, msg } = await ticketCreatedSetup()
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)
  // write assertions to make sure the ack function was called
  expect(msg.ack).toHaveBeenCalled()
})

it('finds, updates and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await ticketUpdatedSetup()
  await listener.onMessage(data, msg)
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { msg, data, ticket, listener } = await ticketUpdatedSetup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener, ticket } = await ticketUpdatedSetup()

  data.version = 10
  try {
    await listener.onMessage(data, msg)
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled()
})

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await expirationCompleteSetup()
  await listener.onMessage(data, msg)
  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
  const { listener, order, data, msg } = await expirationCompleteSetup()
  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )
  expect(eventData.id).toEqual(order.id)
})

it('ack the message', async () => {
  const { listener, data, msg } = await expirationCompleteSetup()
  await listener.onMessage(data, msg)
  expect(msg.ack()).toHaveBeenCalled()
})
