import { Publisher, Subjects, TicketUpdatedEvent } from '@fntickets30/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
