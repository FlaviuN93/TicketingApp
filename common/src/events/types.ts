export enum OrderStatus {
  // When the order has been created, but the ticket
  // it is trying to order has not been reserved
  Created = 'created',

  // The ticket the order is trying to reserver has already been reserved,
  // or when the user has cancelled the order. The order expires before payment
  Cancelled = 'cancelled',

  // The order has succesfully reserved the ticket
  AwaitingPayment = 'awaiting:payment',

  // The order has reserved the ticker and the user has provided payment succesfully
  Complete = 'complete',
}
