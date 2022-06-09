import { IsNotEmpty, IsString } from 'class-validator';

type SettingValue = boolean;

export class Setting {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: SettingValue;
}
