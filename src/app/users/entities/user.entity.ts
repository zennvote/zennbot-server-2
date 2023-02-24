import { IsNotEmpty, IsString } from 'class-validator';

export class User {
  id!: string;

  @IsString()
  @IsNotEmpty()
    username!: string;
}
