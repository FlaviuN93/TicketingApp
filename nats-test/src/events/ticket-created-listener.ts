import { Message } from 'node-nats-streaming'

import { Subjects } from './subjects'
import { Listener } from './base-listener'
import { TicketCreatedEvent } from './events'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = 'payment-service'

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data)
    msg.ack()
  }
}
