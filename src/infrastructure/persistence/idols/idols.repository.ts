import { Injectable } from '@nestjs/common';

import { SheetsService } from 'src/libs/sheets/sheets.service';

import { Idol } from 'src/domain/idols/idols.entity';
import { IdolsRepository as IdolsRepositoryInterface } from 'src/domain/idols/idols.repository';

type IdolDataModel = {
  index: number;
  firstName?: string;
  lastName?: string;
  company?: string;
  unit?: string;
  type?: string;
  birthday?: string;
  age?: string;
  height?: string;
  weight?: string;
  threeSize?: string;
  hometown?: string;
  cv?: string;
  introduction?: string;
};

@Injectable()
export class IdolsRepository implements IdolsRepositoryInterface {
  private readonly sheetsInfo = {
    spreadsheetId: process.env.SHEETS_ID ?? '',
    columns: [
      'firstName',
      'lastName',
      'company',
      'unit',
      'type',
      'birthday',
      'age',
      'height',
      'weight',
      'threeSize',
      'hometown',
      'cv',
      'introduction',
    ] as const,
    startRow: 2,
  };

  constructor(
    private readonly sheets: SheetsService,
  ) {}

  public async findByKeyword(keyword: string): Promise<Idol[]> {
    const rows = await this.sheets.getSheets(this.sheetsInfo);

    const idols = rows
      .filter(
        (row) => keyword === row.firstName
          || keyword === row.lastName
          || (row.firstName && keyword === `${row.firstName} ${row.lastName}`),
      )
      .map(convertFromDataModel);

    return idols;
  }

  public async findMany(id: number[]): Promise<Idol[]> {
    const rows = await this.sheets.getSheets(this.sheetsInfo);
    const idols = rows
      .filter((idol, index) => id.includes(index))
      .map(convertFromDataModel);

    return idols;
  }
}

const convertFromDataModel = (row: IdolDataModel) => {
  if (
    !row.lastName || !row.birthday || !row.age || !row.height || !row.hometown || !row.introduction
  ) {
    throw new Error(`Essential row was empty: ${JSON.stringify(row)}`);
  }

  return new Idol({
    id: row.index,
    firstName: row.firstName,
    lastName: row.lastName,
    company: row.company,
    unit: row.unit,
    type: row.type,
    birthday: row.birthday,
    age: row.age,
    height: row.height,
    weight: row.weight,
    threeSize: row.threeSize,
    hometown: row.hometown,
    cv: row.cv,
    introduction: row.introduction,
  });
};
