import { IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class UserDataModel {
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

  @IsString()
  @IsNotEmpty()
  @Column()
  salt: string;
}
