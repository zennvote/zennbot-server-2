import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'attendance' })
export class AttendanceDataModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  twitchId!: string;

  @Column()
  attendedAt!: Date;

  @Column()
  tier!: number;
}
