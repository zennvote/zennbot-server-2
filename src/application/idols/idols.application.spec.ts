import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { BusinessError, isBusinessError } from 'src/util/business-error';

import { MockIdolsRepository } from 'src/infrastructure/persistence/idols/idols.mock';
import { MockViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.mock';

import { Idol } from 'src/domain/idols/idols.entity';
import { idolsFactory } from 'src/domain/idols/idols.factory';
import { viewerFactory } from 'src/domain/viewers/viewers.factory';

import { IdolsApplication } from './idols.application';

describe('idols.application', () => {
  let sandbox: SinonSandbox;
  let application: IdolsApplication;
  let idolsRepository: MockIdolsRepository;
  let viewersRepository: MockViewersRepository;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    idolsRepository = new MockIdolsRepository(sandbox);
    viewersRepository = new MockViewersRepository(sandbox);

    application = new IdolsApplication(idolsRepository, viewersRepository);
  });

  afterEach(() => sandbox.restore());

  describe('queryIdols', () => {
    beforeEach(async () => {
      idolsRepository.all = sandbox.fake.resolves([
        await idolsFactory.create({ firstName: '오오츠키', lastName: '유이' }),
        await idolsFactory.create({ firstName: '유메미', lastName: '리아무' }),
      ]);
    });

    it('아이돌 리스트를 조회할 수 있어야 한다.', async () => {
      const result = await application.queryIdols();

      expect(result).toMatchObject([
        { firstName: '오오츠키', lastName: '유이' },
        { firstName: '유메미', lastName: '리아무' },
      ]);
      expect(result[0]).toBeInstanceOf(Idol);
    });
  });

  describe('queryBiasProducer', () => {
    beforeEach(async () => {
      const idol = await idolsFactory.create({
        firstName: '오오츠키',
        lastName: '유이',
      });

      idolsRepository.findByKeyword = sandbox.fake.resolves([idol]);
      viewersRepository.findByBiasIdols = sandbox.fake.resolves([
        await viewerFactory.create({ username: '라떼락대' }),
        await viewerFactory.create({ username: '리하즈' }),
      ]);
    });

    it('아이돌의 담당 프로듀서 리스트를 조회할 수 있어야 한다.', async () => {
      const result = await application.queryBiasProducer('유이');

      expect(result).not.toBeInstanceOf(BusinessError);
      if (isBusinessError(result)) throw new Error(result.error);

      expect(result.viewers).toHaveLength(2);
      expect(result.viewers[0].username).toBe('라떼락대');
      expect(result.viewers[1].username).toBe('리하즈');
    });

    it('해당하는 아이돌이 두명 이상일 경우 실패해야 한다.', async () => {
      idolsRepository.findByKeyword = sandbox.fake.resolves([
        await idolsFactory.create({ firstName: '카미야', lastName: '나오' }),
        await idolsFactory.create({ firstName: '오카무라', lastName: '나오' }),
        await idolsFactory.create({ firstName: '요코야마', lastName: '나오' }),
      ]);

      const result = await application.queryBiasProducer('나오');

      expect(result).toBeInstanceOf(BusinessError);
      if (!isBusinessError(result)) throw new Error();

      expect(result.error).toBe('multiple-idol');
    });

    it('해당하는 아이돌이 없을 경우 실패해야 한다.', async () => {
      idolsRepository.findByKeyword = sandbox.fake.resolves([]);

      const result = await application.queryBiasProducer('no-idol');

      expect(result).toBeInstanceOf(BusinessError);
      if (!isBusinessError(result)) throw new Error();

      expect(result.error).toBe('no-idol');
    });
  });
});
