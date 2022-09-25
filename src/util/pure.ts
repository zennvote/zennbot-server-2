import { AggregateRoot } from '@nestjs/cqrs';

export type Pure<T extends AggregateRoot> = Omit<T, keyof AggregateRoot>;
