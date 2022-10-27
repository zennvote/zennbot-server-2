import { SinonSandbox } from 'sinon';

import { IdolsRepository } from 'src/domain/idols/idols.repository';

export class MockIdolsRepository implements IdolsRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public findByKeyword = this.sinon.fake.resolves([]);
  public findMany = this.sinon.fake.resolves([]);
  public all = this.sinon.fake.resolves([]);
}
