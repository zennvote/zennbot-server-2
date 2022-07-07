import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'attendance' })
@Index(['twitchId', 'attendedAt'], { unique: true })
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
