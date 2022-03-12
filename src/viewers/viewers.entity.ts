import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Index('twitchId', ['twitchId'], { unique: true })
@Entity()
export class Viewer {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  username: string;

  @IsString()
  @Column({ unique: true, nullable: true })
  twitchId?: string;

  @IsInt()
  @Column({ default: 0 })
  ticket: number;

  @IsInt()
  @Column({ default: 0 })
  ticketPiece: number;

  @Column({ nullable: true })
  prefix?: string;
}
