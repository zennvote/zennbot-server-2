export interface IdolInitializer {
  firstName?: string;
  lastName?: string;
  company?: string;
  unit?: string;
  type?: string;
  birthday?: string;
  age?: string;
  height?: string;
  weight?: string;
  threeSize?: string;
  hometown?: string;
  cv?: string;
  introduction?: string;
}

export class Idol {
  firstName: string;

  lastName: string;

  company: string;

  unit: string;

  type: string;

  birthday: string;

  age: string;

  height: string;

  weight: string;

  threeSize: string;

  hometown: string;

  cv: string;

  introduction: string;

  constructor(initializer?: IdolInitializer) {
    this.firstName = initializer?.firstName;
    this.lastName = initializer?.lastName;
    this.company = initializer?.company;
    this.unit = initializer?.unit;
    this.type = initializer?.type;
    this.birthday = initializer?.birthday;
    this.age = initializer?.age;
    this.height = initializer?.height;
    this.weight = initializer?.weight;
    this.threeSize = initializer?.threeSize;
    this.hometown = initializer?.hometown;
    this.cv = initializer?.cv;
    this.introduction = initializer?.introduction;
  }
}
