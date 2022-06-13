import { Test } from '@nestjs/testing';
import { FlagSetting, Setting } from './entities/setting.entity';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let repository: SettingsRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SettingsService, { provide: SettingsRepository, useValue: {} }],
    }).compile();

    service = module.get(SettingsService);
    repository = module.get(SettingsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('getSetting', () => {
    it('key에 맞는 설정을 반환해야 함', async () => {
      repository.getSetting = jest.fn(async () => {
        const setting = new FlagSetting();
        setting.key = 'setting1';
        setting.value = true;
        return setting;
      });

      const result = await service.getSetting('setting1');

      expect(result).toBeInstanceOf(Setting);
      expect(result.key).toBe('setting1');
      expect(result.value).toBe(true);
      expect(repository.getSetting).toBeCalledWith('setting1');
    });
  });
});
