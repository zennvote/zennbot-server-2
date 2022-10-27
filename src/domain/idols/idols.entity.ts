import { Entity, EntityProps } from 'src/domain/types/entity';

const requiredKey = [
  'id', 'lastName', 'birthday', 'age', 'height', 'weight', 'hometown', 'introduction',
] as const;
const optionalKey = [
  'firstName', 'company', 'unit', 'type', 'threeSize', 'cv',
] as const;

const constructorKey = [...requiredKey, ...optionalKey] as const;
export type IdolProps = EntityProps<Idol, typeof requiredKey, typeof optionalKey>;

export class Idol extends Entity {
  public readonly id!: number;
  public readonly firstName?: string;
  public readonly lastName!: string;
  public readonly company?: string;
  public readonly unit?: string;
  public readonly type?: string;
  public readonly birthday!: string;
  public readonly age!: string;
  public readonly height!: string;
  public readonly weight?: string;
  public readonly threeSize?: string;
  public readonly hometown!: string;
  public readonly cv?: string;
  public readonly introduction!: string;

  constructor(props: IdolProps) {
    super(props, constructorKey);
  }

  get fullName() {
    return this.firstName ? `${this.firstName} ${this.lastName}` : this.lastName;
  }

  get stringified() {
    const name = this.fullName;
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
    return invalid || undefined;
  }
  return suffix + value + prefix;
};
