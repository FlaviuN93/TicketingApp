import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@fntickets30/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}
