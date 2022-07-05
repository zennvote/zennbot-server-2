import { IsNotEmpty, IsString } from 'class-validator';

type SettingValue = boolean;

export class Setting {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsNotEmpty()
  value!: SettingValue;
}

export class FlagSetting extends Setting {
  value!: boolean;

  constructor({ key, value }: { key?: string; value?: boolean } = {}) {
    super();

    if (key) {
      this.key = key;
    }
    if (value) {
      this.value = value;
    }
  }
}
