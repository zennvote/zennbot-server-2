import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Manager {
  @ApiProperty()
  id!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  twitchId!: string;
}
