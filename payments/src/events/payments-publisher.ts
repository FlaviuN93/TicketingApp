import { Subjects, Publisher, PaymentCreatedEvent } from '@fntickets30/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
