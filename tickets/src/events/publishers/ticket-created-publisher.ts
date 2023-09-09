import { Publisher, Subjects, TicketCreatedEvent } from '@fntickets30/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
