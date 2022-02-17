import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('username', ['username'], { unique: true })
@Entity()
export class Viewer {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column()
  username: string;

  @IsString()
  @Column()
  twitchId?: string;

  @IsInt()
  @Column({ default: 0 })
  ticket: number;

  @IsInt()
  @Column({ default: 0 })
  ticketPiece: number;

  @Column()
  prefix?: string;
}
