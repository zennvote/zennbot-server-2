type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...a: any[]) => any ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type IBuilder<T> = {
  [k in keyof NonFunctionProperties<T> as `set${Capitalize<string & k>}`]: (arg: T[k]) => IBuilder<T>;
};

interface NoParamConstructor<T> {
  new (): T;
}

export abstract class Builder<T> {
  public object: T;

  constructor(ctor: NoParamConstructor<T>) {
    this.object = new ctor();
  }

  build(): T {
    return this.object;
  }
}
