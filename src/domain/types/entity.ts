export abstract class Entity {
  public readonly id!: string;

  protected constructor(id: string) {
    this.id = id;
  }

  protected get mutable() {
    return this as { -readonly [K in keyof this]: this[K] };
  }
}
