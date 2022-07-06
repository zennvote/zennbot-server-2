import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum SettingType {
  Flag = 'flag',
}

@Entity({ name: 'setting' })
export class SettingDataModel {
  @PrimaryColumn()
  key!: string;

  @Column()
  type!: SettingType;

  @Column({ nullable: true })
  flagValue!: boolean;
}
