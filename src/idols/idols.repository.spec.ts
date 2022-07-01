import { Test } from '@nestjs/testing';
import { SheetsService } from 'src/libs/sheets/sheets.service';
import { Idol } from './idols.entity';
import { IdolsRepository } from './idols.repository';

describe('IdolsRepository', () => {
  let repository: IdolsRepository;
  let sheetsService: SheetsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IdolsRepository, { provide: SheetsService, useValue: {} }],
    }).compile();

    repository = module.get(IdolsRepository);
    sheetsService = module.get(SheetsService);

    sheetsService.getSheets = jest.fn().mockResolvedValue(sampleSheets);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(sheetsService).toBeDefined();
  });

  describe('search', () => {
    it('키워드를 통해 이름이 정확히 같은 아이돌을 찾을 수 있어야 한다', async () => {
      const result = await repository.search('나나');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Idol);
      expect(result[0]).toMatchObject({
        firstName: '아베',
        lastName: '나나',
        company: '346',
        type: '큐트',
        birthday: '5월 15일',
        age: '17',
        height: '146',
        weight: '40',
        threeSize: '84-57-84',
        hometown: '우사밍 별',
        cv: '미야케 마리에',
        introduction: '영원한 17세, 우사밍 성에서 온 메이드 토끼 아이돌',
      });
    });

    it('키워드를 통해 성이 정확히 같은 아이돌을 찾을 수 있어야 한다', async () => {
      const result = await repository.search('사토');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Idol);
      expect(result[0]).toMatchObject({
        firstName: '사토',
        lastName: '신',
        company: '346',
        type: '패션',
        birthday: '7월 22일',
        age: '26',
        height: '166',
        weight: '(불명)',
        threeSize: '(불명)',
        hometown: '나가노',
        cv: '하나모리 유미리',
        introduction: '귀여워지기 위해 뭐든 다 하는 달콤살벌(?) 스위티 아이돌',
      });
    });

    it('키워드를 통해 풀네임이 정확히 같은 아이돌을 찾을 수 있어야 한다', async () => {
      const result = await repository.search('유사 코즈에');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Idol);
      expect(result[0]).toMatchObject({
        firstName: '유사',
        lastName: '코즈에',
        company: '346',
        type: '큐트',
        birthday: '2월 19일',
        age: '11',
        height: '130',
        weight: '29',
        threeSize: '62-50-65',
        hometown: '고치',
        cv: '하나타니 마키',
        introduction: '몽실몽실 잠꾸러기 신비로운 천재 아이돌',
      });
    });

    it('동명이인을 모두 반환해야 한다', async () => {
      const result = await repository.search('나오');
      const sorted = result.sort((a, b) => a.firstName.localeCompare(b.firstName));

      expect(sorted).toHaveLength(2);
      expect(sorted[0]).toBeInstanceOf(Idol);
      expect(sorted[0].firstName).toBe('오카무라');
      expect(sorted[0].lastName).toBe('나오');
      expect(sorted[1]).toBeInstanceOf(Idol);
      expect(sorted[1].firstName).toBe('요코야마');
      expect(sorted[1].lastName).toBe('나오');
    });
  });
});

const sampleSheets = [
  {
    firstName: '오카무라',
    lastName: '나오',
    company: '315',
    unit: '모후모후엔',
    type: '인텔리',
    birthday: '3월 25일',
    age: '11',
    height: '143',
    weight: '33',
    threeSize: '',
    hometown: '치바',
    cv: '야노 쇼고',
    introduction: '부끄러움 많지만 본방에 강한 천재 아역배우 출신 아이돌',
  },
  {
    firstName: '요코야마',
    lastName: '나오',
    company: '765',
    unit: '',
    type: '프린세스',
    birthday: '2월 12일',
    age: '17',
    height: '159',
    weight: '46',
    threeSize: '84-57-83',
    hometown: '오사카',
    cv: '와타나베 유이',
    introduction: '목표는 관서의 별, 밝고 활기찬 오사카 아이돌',
  },
  {
    firstName: '아베',
    lastName: '나나',
    company: '346',
    unit: '',
    type: '큐트',
    birthday: '5월 15일',
    age: '17',
    height: '146',
    weight: '40',
    threeSize: '84-57-84',
    hometown: '우사밍 별',
    cv: '미야케 마리에',
    introduction: '영원한 17세, 우사밍 성에서 온 메이드 토끼 아이돌',
  },
  {
    firstName: '유사',
    lastName: '코즈에',
    company: '346',
    unit: '',
    type: '큐트',
    birthday: '2월 19일',
    age: '11',
    height: '130',
    weight: '29',
    threeSize: '62-50-65',
    hometown: '고치',
    cv: '하나타니 마키',
    introduction: '몽실몽실 잠꾸러기 신비로운 천재 아이돌',
  },
  {
    firstName: '사토',
    lastName: '신',
    company: '346',
    unit: '',
    type: '패션',
    birthday: '7월 22일',
    age: '26',
    height: '166',
    weight: '(불명)',
    threeSize: '(불명)',
    hometown: '나가노',
    cv: '하나모리 유미리',
    introduction: '귀여워지기 위해 뭐든 다 하는 달콤살벌(?) 스위티 아이돌',
  },
  {
    firstName: '',
    lastName: '아나스타샤',
    company: '346',
    unit: '',
    type: '쿨',
    birthday: '9월 19일',
    age: '15',
    height: '165',
    weight: '42',
    threeSize: '80-54-80',
    hometown: '홋카이도',
    cv: '우에사카 스미레',
    introduction: '별을 사랑하는 러시아 혼혈 아이돌',
  },
];
