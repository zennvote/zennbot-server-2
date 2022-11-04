import { IsArray } from 'class-validator';

export class SetBiasIdolsDto {
  @IsArray() ids!: number[];
}
