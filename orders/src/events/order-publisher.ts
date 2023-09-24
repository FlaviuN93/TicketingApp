import {
  Publisher,
  OrderCreatedEvent,
  OrderCancelledEvent,
} from '@fntickets30/common'
import { Subjects } from '@fntickets30/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
