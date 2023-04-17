export class BusinessError<T extends string> {
  constructor(public readonly error: T) { }
}

export const isBusinessError = (
  value: BusinessError<string> | any,
): value is BusinessError<string> => value instanceof BusinessError;

export type Errorable<T> = T extends BusinessError<infer U> ? U : never;
export type ErrorMap<T, R = string> = { [key in Errorable<T>]: R | Error };
export const mapError = <T, R = string>(error: T, errorMap: ErrorMap<T, R>) => {
  if (isBusinessError(error)) {
    if (errorMap[error.error] instanceof Error) throw errorMap[error.error];
    return errorMap[error.error];
  }
  return error;
};
