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
  firstName!: string;
  lastName!: string;
  company!: string;
  unit!: string;
  type!: string;
  birthday!: string;
  age!: string;
  height!: string;
  weight!: string;
  threeSize!: string;
  hometown!: string;
  cv!: string;
  introduction!: string;

  constructor(initializer?: IdolInitializer) {
    if (initializer) {
      this.firstName = initializer?.firstName ?? this.firstName;
      this.lastName = initializer?.lastName ?? this.lastName;
      this.company = initializer?.company ?? this.company;
      this.unit = initializer?.unit ?? this.unit;
      this.type = initializer?.type ?? this.type;
      this.birthday = initializer?.birthday ?? this.birthday;
      this.age = initializer?.age ?? this.age;
      this.height = initializer?.height ?? this.height;
      this.weight = initializer?.weight ?? this.weight;
      this.threeSize = initializer?.threeSize ?? this.threeSize;
      this.hometown = initializer?.hometown ?? this.hometown;
      this.cv = initializer?.cv ?? this.cv;
      this.introduction = initializer?.introduction ?? this.introduction;
    }
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
