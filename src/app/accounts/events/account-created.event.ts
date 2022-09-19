import { IEvent } from '@nestjs/cqrs';

export class AccountCreatedEvent implements IEvent {
  constructor(public readonly accountId: number) {}
}
