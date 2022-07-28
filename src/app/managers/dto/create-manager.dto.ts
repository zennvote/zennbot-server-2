import { ApiProperty } from '@nestjs/swagger';

export class CreateManagerDto {
  @ApiProperty()
    twitchId!: string;
}
