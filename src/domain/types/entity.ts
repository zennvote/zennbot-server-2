export abstract class Entity {
  protected readonly id!: number;

  constructor(props?: any, keys?: readonly string[]) {
    if (props) {
      (keys ?? Object.keys(props)).forEach((key) => {
        this[key as any] = props[key];
      });
    }
  }

  protected get mutable() {
    return this as { -readonly [K in keyof this]: this[K] };
  }

  public get persisted() {
    return this.id !== -1;
  }
}

export type EntityProps<
  T extends Entity,
  K extends readonly (keyof T)[],
  O extends readonly (keyof T)[] = [],
> = {
  [Key in K[number]]: T[Key];
} & {
  [Key in O[number]]?: T[Key];
};
