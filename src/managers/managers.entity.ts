import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Manager {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  @ApiProperty()
  twitchId: string;
}
