import { createTestDbConnection } from 'src/test-utils';
import { Connection, Repository } from 'typeorm';
import { SettingDataModel, SettingType } from './entities/setting.datamodel';
import { FlagSetting } from './entities/setting.entity';
import { SettingsRepository } from './settings.repository';

describe('SettingsRepository', () => {
  let db: Connection;
  let repository: SettingsRepository;
  let typeormRepository: Repository<SettingDataModel>;

  beforeEach(async () => {
    db = await createTestDbConnection([SettingDataModel]);
    typeormRepository = await db.getRepository(SettingDataModel);
    repository = new SettingsRepository(typeormRepository);
  });

  afterEach(() => db.close());

  describe('getSetting', () => {
    it('key에 맞는 setting값을 가져와야 한다.', async () => {
      await typeormRepository.save(
        typeormRepository.create([
          { key: 'setting1', type: SettingType.Flag, flagValue: false },
          { key: 'setting2', type: SettingType.Flag, flagValue: true },
          { key: 'setting3', type: SettingType.Flag, flagValue: false },
        ]),
      );

      const result = await repository.getSetting('setting2');

      expect(result).toBeInstanceOf(FlagSetting);
      expect(result.key).toBe('setting2');
      expect(result.value).toBe(true);
    });

    it('key에 맞는 setting이 없을 시 null을 반환해야 한다', async () => {
      const result = await repository.getSetting('setting2');

      expect(result).toBeNull();
    });
  });

  describe('setFlagSetting', () => {
    it('key에 맞는 setting값을 갱신해야 한다.', async () => {
      await typeormRepository.save({ key: 'setting1', type: SettingType.Flag, flagValue: false });

      const result = await repository.setFlagSetting('setting1', true);

      const actually = await typeormRepository.findOne({ where: { key: 'setting1' } });
      expect(result).toBe(true);
      expect(actually).toBeDefined();
      expect(actually.flagValue).toBe(true);
    });

    it('key에 맞는 setting값이 없을 경우 false를 반환해야 한다', async () => {
      const result = await repository.setFlagSetting('setting1', true);

      expect(result).toBe(false);
    });
  });
});
