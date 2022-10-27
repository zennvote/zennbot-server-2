import { Idol } from './idols.entity';

export interface IdolsRepository {
  findByKeyword(keyword: string): Promise<Idol[]>
  findMany(id: number[]): Promise<Idol[]>
  all(): Promise<Idol[]>
}
