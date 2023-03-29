import { Idol } from './idols.entity';

export const IDOLS_REOPSITORY = 'IDOLS_REPOSITORY';

export interface IdolsRepository {
  findByKeyword(keyword: string): Promise<Idol[]>
  findMany(id: number[]): Promise<Idol[]>
  all(): Promise<Idol[]>
}
