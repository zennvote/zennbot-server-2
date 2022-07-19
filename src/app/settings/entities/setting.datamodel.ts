export enum SettingType {
  Flag = 'flag',
}

export class SettingDataModel {
  key!: string;
  type!: SettingType;
  flagValue!: boolean;
}
