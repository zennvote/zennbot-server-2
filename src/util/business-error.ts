export class BusinessError<T extends string> {
  constructor(public readonly error: T) { }
}

export const isBusinessError = (
  value: BusinessError<string> | any,
): value is BusinessError<string> => value instanceof BusinessError;

export type Error<T> = T extends BusinessError<infer U> ? U : never;
export type ErrorMap<T, R = string> = { [key in Error<T>]: R }
