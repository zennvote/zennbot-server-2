import { Test } from '@nestjs/testing';
import { isBusinessError } from 'src/util/business-error';
import { IdolsApplication } from './idols.application';
import { Idol } from './idols.entity';
import { IdolsRepository } from './idols.repository';
import { IdolsService } from './idols.service';

describe('IdolsApplication', () => {
  let application: IdolsApplication;
  let service: IdolsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IdolsApplication,
        { provide: IdolsService, useValue: {} },
        { provide: IdolsRepository, useValue: {} },
      ],
    }).compile();

    application = module.get(IdolsApplication);
    service = module.get(IdolsService);
  });

  it('should be defined', () => {
    expect(application).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('searchIdol', () => {
    it('아이돌 검색 결과를 반환해야 한다', async () => {
      const expected = [new Idol({ firstName: '히구치', lastName: '마도카' })];
      service.searchIdols = jest.fn().mockResolvedValue(expected);

      const result = await application.searchIdol('히구치 마도카');

      expect(result).toBeInstanceOf(Idol);
      expect(result).toMatchObject({ firstName: '히구치', lastName: '마도카' });
    });

    it('아이돌 검색 결과가 여러개 나왔을 시 에러를 반환해야 한다', async () => {
      const expected = [
        new Idol({ firstName: '오카무라', lastName: '나오' }),
        new Idol({ firstName: '요코야마', lastName: '나오' }),
        new Idol({ firstName: '카미야', lastName: '나오' }),
      ];
      service.searchIdols = jest.fn().mockResolvedValue(expected);

      const result = await application.searchIdol('나오');

      expect(isBusinessError(result)).toBeTrue();
      expect(result).toHaveProperty('error', 'multiple-result');
    });

    it('아이돌 검색 결과가 없을 시 에러를 반환해야 한다', async () => {
      service.searchIdols = jest.fn().mockResolvedValue([]);

      const result = await application.searchIdol('시프트');

      expect(isBusinessError(result)).toBeTrue();
      expect(result).toHaveProperty('error', 'no-result');
    });
  });

  describe('getBirthdayIdols', () => {
    it('오늘 생일인 아이돌을 반환해야 한다.', async () => {
      const expected = [
        new Idol({ firstName: '스나즈카', lastName: '아키라' }),
        new Idol({ firstName: '유메미', lastName: '리아무' }),
      ];
      const now = new Date(2022, 11, 24);

      jest.useFakeTimers().setSystemTime(now);
      service.getBirthdayIdols = jest.fn().mockResolvedValue(expected);

      const result = await application.getBirthdayIdols();

      expect(result).toMatchObject(expected);
      expect(service.getBirthdayIdols).toBeCalledWith(now);
    });

    it('오늘 생일인 아이돌이 없다면 에러를 반환해야 한다', async () => {
      const expected = [];
      const now = new Date(2022, 11, 24);

      jest.useFakeTimers().setSystemTime(now);
      service.getBirthdayIdols = jest.fn().mockResolvedValue(expected);

      const result = await application.getBirthdayIdols();

      expect(isBusinessError(result)).toBeTrue();
      expect(result).toHaveProperty('error', 'no-result');
    });
  });
});
