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

  get stringified() {
    const name = this.firstName ? `${this.firstName} ${this.lastName}` : this.lastName;
    const idolInfo = [
      parseInformation(this.company, '소속사 불명', ' 프로덕션'),
      parseInformation(this.unit, null, ' 소속'),
      parseInformation(this.type, null, '타입'),
    ]
      .filter((value) => value)
      .join(', ');
    const birthday = parseInformation(this.birthday, '생일 불명', '생');
    const age = parseInformation(this.age, '나이 불명', '세');
    const bodyInfo = [
      parseInformation(this.height, '신장 불명', 'cm'),
      parseInformation(this.weight, '체중 불명', 'kg'),
      parseInformation(this.threeSize, null),
    ]
      .filter((value) => value)
      .join(', ');
    const hometown = parseInformation(this.hometown, '출신지 불명', ' 출신');
    const cv = parseInformation(this.cv, null, '', 'CV. ');

    return [name, idolInfo, birthday, age, bodyInfo, hometown, cv, this.introduction]
      .filter((value) => value)
      .join(' / ');
  }
}

const parseInformation = (value: string | undefined, invalid: string | null, prefix = '', suffix = '') => {
  if (!value) {
    return undefined;
  }
  if (value === '불명') {
    return invalid ? invalid : undefined;
  }
  return suffix + value + prefix;
};
