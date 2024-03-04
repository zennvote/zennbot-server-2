import * as sinon from 'sinon';

import { isBusinessError } from 'src/util/business-error';

import { MockViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.mock';

import { viewerChzzkMigrationRequestFactory } from 'src/domain/viewers/viewer-chzzk-migration-request.factory';
import { viewerFactory } from 'src/domain/viewers/viewers.factory';

import { ViewersApplication } from './viewers.application';

describe('viewers.application', () => {
  let sandbox: sinon.SinonSandbox;
  let viewersApplication: ViewersApplication;
  let viewersRepository: MockViewersRepository;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    viewersRepository = new MockViewersRepository(sandbox);

    viewersApplication = new ViewersApplication(viewersRepository);
  });

  describe('requestMigrationToChzzk', () => {
    it('치지직 마이그레이션을 신청할 수 있어야 한다.', async () => {
      const viewer = await viewerFactory.create({ twitchId: 'twitch-id', username: 'twitch-username' });
      viewersRepository.findOneByUsername = sandbox.fake(async () => viewer);

      const result = await viewersApplication.requestMigrationToChzzk('twitch-username', 'chzzk-id', 'chzzk-username');
      expect(isBusinessError(result)).toBeFalse();
      if (isBusinessError(result)) return;

      const [persistedViewer, persistedMigration] = result;

      expect(persistedViewer).toBe(viewer);
      expect(persistedMigration).toHaveProperty('id');
      expect(persistedMigration).toHaveProperty('twitchId', 'twitch-id');
      expect(persistedMigration).toHaveProperty('twitchUsername', 'twitch-username');
      expect(persistedMigration).toHaveProperty('chzzkId', 'chzzk-id');
      expect(persistedMigration).toHaveProperty('chzzkUsername', 'chzzk-username');

      expect(viewersRepository.save.callCount).toBe(1);
      expect(viewersRepository.saveMigration.callCount).toBe(1);
      expect(viewersRepository.save.calledWith(viewer)).toBeTrue();
      expect(viewersRepository.saveMigration.calledWith(persistedMigration)).toBeTrue();
    });

    it('치지직 마이그레이션이 완료된 유저는 마이그레이션을 신청할 수 없어야 한다.', async () => {
      const viewer = await viewerFactory.create({ twitchId: '!!chzzk{}', username: 'twitch-username' });
      viewersRepository.findOneByUsername = sandbox.fake(async () => viewer);

      const result = await viewersApplication.requestMigrationToChzzk('twitch-username', 'chzzk-id', 'chzzk-username');

      expect(isBusinessError(result)).toBeTrue();
      expect(result).toHaveProperty('error', 'already-migrated');
    });

    it('존재하지 않는 유저는 마이그레이션을 신청할 수 없어야 한다.', async () => {
      const result = await viewersApplication.requestMigrationToChzzk('twitch-username', 'chzzk-id', 'chzzk-username');

      expect(isBusinessError(result)).toBeTrue();
      expect(result).toHaveProperty('error', 'no-viewer');
    });
  });

  describe('acceptMigrationToChzzk', () => {
    it('치지직 마이그레이션을 수락할 수 있어야 한다.', async () => {
      const migration = await viewerChzzkMigrationRequestFactory.create({
        twitchId: 'twitch-id',
        twitchUsername: 'twitch-username',
        chzzkId: 'chzzk-id',
        chzzkUsername: 'chzzk-username',
      });
      viewersRepository.findOneMigration = sandbox.fake(async () => migration);

      const viewer = await viewerFactory.create({ twitchId: 'twitch-id', username: 'twitch-username' });
      viewersRepository.findOne = sandbox.fake(async () => viewer);

      const result = await viewersApplication.acceptMigrationToChzzk(migration.id);
      expect(isBusinessError(result)).toBeFalse();
      if (isBusinessError(result)) return;

      const [persistedViewer, persistedMigration] = result;

      expect(persistedViewer).toBe(viewer);
      expect(persistedMigration).toBe(migration);
      expect(persistedViewer.twitchId).toStartWith('!!chzzk{');
      expect(persistedViewer.twitchId).toEndWith('}');
      expect(persistedViewer.twitchId).toInclude('"chzzkId":"chzzk-id"');
      expect(persistedViewer.twitchId).toInclude('"twitchId":"twitch-id"');
      expect(() => JSON.stringify(persistedViewer.twitchId?.replace('!!chzzk', ''))).not.toThrowError();

      expect(viewersRepository.save.callCount).toBe(1);
      expect(viewersRepository.saveMigration.callCount).toBe(1);
      expect(viewersRepository.save.calledWith(viewer)).toBeTrue();
      expect(viewersRepository.saveMigration.calledWith(migration)).toBeTrue();
    });

    it('존재하지 않는 마이그레이션은 수락할 수 없어야 한다.', async () => {
      const result = await viewersApplication.acceptMigrationToChzzk('migration-id');

      expect(isBusinessError(result)).toBeTrue();
      expect(result).toHaveProperty('error', 'no-migration');
    });

    it('치지직 마이그레이션이 완료된 유저는 마이그레이션을 수락할 수 없어야 한다.', async () => {
      const viewer = await viewerFactory.create({ twitchId: '!!chzzk{}', username: 'twitch-username' });
      const migration = await viewerChzzkMigrationRequestFactory.create();
      viewersRepository.findOne = sandbox.fake(async () => viewer);
      viewersRepository.findOneMigration = sandbox.fake(async () => migration);

      const result = await viewersApplication.acceptMigrationToChzzk('migration-id');

      expect(isBusinessError(result)).toBeTrue();
      expect(result).toHaveProperty('error', 'already-migrated');
    });
  });
});
