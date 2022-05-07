import { IsNotEmpty, IsString } from 'class-validator';

export class User {
  id: number;

  @IsString()
  @IsNotEmpty()
  username: string;
}
