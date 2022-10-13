import { SinonSandbox } from 'sinon';

import { Viewer } from 'src/domain/viewers/viewers.entity';
import { ViewersRepository } from 'src/domain/viewers/viewers.repository';

export class MockViewersRepository implements ViewersRepository {
  constructor(public readonly sinon: SinonSandbox) {}

  public isExisting = this.sinon.fake.resolves(true);
  public findOne = this.sinon.fake.resolves(null);
  public save = this.sinon.fake(async (viewer: Viewer) => viewer);
}
