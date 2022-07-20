import { Test, TestingModule } from '@nestjs/testing';
import { Idol } from './idols.entity';
import { IdolsRepository } from './idols.repository';
import { IdolsService } from './idols.service';

describe('IdolsService', () => {
  let service: IdolsService;
  let repository: IdolsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdolsService, { provide: IdolsRepository, useValue: {} }],
    }).compile();

    service = module.get<IdolsService>(IdolsService);
    repository = module.get(IdolsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('searchIdols', () => {
    it('아이돌 검색 목록을 반환해야 한다.', async () => {
      const expected = [
        new Idol({ firstName: '이세야', lastName: '시키' }),
        new Idol({ firstName: '이치노세', lastName: '시키' }),
      ];
      repository.search = jest.fn().mockResolvedValue(expected);

      const result = await service.searchIdols('시키');

      expect(result).toMatchObject([
        { firstName: '이세야', lastName: '시키' },
        { firstName: '이치노세', lastName: '시키' },
      ]);
      expect(result[0]).toBeInstanceOf(Idol);
      expect(repository.search).toBeCalledWith('시키');
    });
  });

  describe('getBirthdayIdols', () => {
    it('날짜를 기준으로 생일인 아이돌 목록을 반환해야 한다', async () => {
      const expected = [
        new Idol({ firstName: '히구치', lastName: '마도카' }),
        new Idol({ firstName: '사기사와', lastName: '후미카' }),
      ];
      const date = new Date(2022, 9, 27);
      repository.findByBirthday = jest.fn().mockResolvedValue(expected);

      const result = await service.getBirthdayIdols(date);

      expect(result).toMatchObject([
        { firstName: '히구치', lastName: '마도카' },
        { firstName: '사기사와', lastName: '후미카' },
      ]);
      expect(result[0]).toBeInstanceOf(Idol);
      expect(repository.findByBirthday).toBeCalledWith(date);
    });
  });
});
