import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('twitchId', ['twitchId'], { unique: true })
@Entity()
export class Viewer {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column()
  username: string;

  @IsString()
  @Column({ nullable: true })
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
