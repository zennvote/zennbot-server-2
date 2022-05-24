export class BusinessError<T extends string> {
  constructor(public readonly error: T) {}
}

export const isBusinessError = (value: BusinessError<string> | any): value is BusinessError<string> => {
  return value instanceof BusinessError;
};
