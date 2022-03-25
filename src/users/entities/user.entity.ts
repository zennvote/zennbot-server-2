import { IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  username: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  password: string;
}
