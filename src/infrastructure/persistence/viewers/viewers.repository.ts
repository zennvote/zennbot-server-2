import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/libs/prisma/prisma.service';
import { SheetsService } from 'src/libs/sheets/sheets.service';

import { ViewerChzzkMigrationRequest } from 'src/domain/viewers/viewer-chzzk-migration-request.entity';
import { Viewer } from 'src/domain/viewers/viewers.entity';
import { ViewersRepository as ViewersRepositoryInterface, VIEWERS_REPOSITORY } from 'src/domain/viewers/viewers.repository';

type ViewerDataModel = {
  index: number;
  twitchId?: string;
  username?: string;
  ticketPiece?: string;
  ticket?: string;
  prefix?: string;
}

@Injectable()
export class ViewersRepository implements ViewersRepositoryInterface {
  private readonly sheetsInfo = {
    spreadsheetId: process.env.SHEETS_ID ?? '',
    columns: [
      'twitchId',
      'username',
      'ticketPiece',
      'ticket',
      'prefix',
    ] as const,
    startRow: 6,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly sheets: SheetsService,
  ) { }

  async findOne(twitchId: string, username: string): Promise<Viewer | null> {
    const rows = await this.sheets.getSheets(this.sheetsInfo);

    const row = rows.find((row) => row.twitchId === twitchId || row.username === username);
    if (!row) return null;

    if (row.username !== username || row.twitchId !== twitchId) {
      // TODO: ID 불일치에 대한 갱신을 중단. twitchId가 chzzk migration metadata로 사용되고 있음.
      // await this.sheets.updateSheets(this.sheetsInfo, row.index, { twitchId, username });
    }

    const biasIdolIds = await this.getBiasIdolIds(username);

    return convertFromDataModel(row, biasIdolIds.map((id) => `${id}`));
  }

  async findOneByUsername(username: string): Promise<Viewer | null> {
    const rows = await this.sheets.getSheets(this.sheetsInfo);

    const row = rows.find((row) => row.username === username);
    if (!row) return null;

    const biasIdolIds = await this.getBiasIdolIds(username);

    return convertFromDataModel(row, biasIdolIds.map((id) => `${id}`));
  }

  async findByBiasIdols(idolId: number): Promise<Viewer[]> {
    const viewerQuery = await this.prisma.biasIdol.findMany({
      where: { idolId },
      orderBy: { createdAt: 'asc' },
    });

    const rows = await this.sheets.getSheets(this.sheetsInfo);
    const filtered = viewerQuery
      .map((query) => {
        const viewer = rows.find((viewer) => viewer.username === query.viewerUsername);
        if (!viewer) return viewer;

        return convertFromDataModel(viewer, [`${idolId}`]);
      })
      .filter((viewer): viewer is Viewer => viewer !== undefined);

    return filtered;
  }

  async save(viewer: Viewer): Promise<Viewer> {
    if ((viewer.numaricId ?? -1) < -1) {
      return this.create(viewer);
    }

    const result = await this.sheets.updateSheets(this.sheetsInfo, viewer.numaricId, viewer);
    await this.prisma.biasIdol.deleteMany({
      where: {
        viewerUsername: viewer.username,
        NOT: {
          idolId: { in: viewer.viasIdolIds.map((idolId) => parseInt(idolId, 10)) },
        },
      },
    });
    await this.prisma.biasIdol.createMany({
      data: viewer.viasIdolIds.map((idolId) => ({
        viewerUsername: viewer.username,
        idolId: parseInt(idolId, 10),
      })),
      skipDuplicates: true,
    });

    return convertFromDataModel(result, viewer.viasIdolIds);
  }

  async saveMigration(migration: ViewerChzzkMigrationRequest): Promise<ViewerChzzkMigrationRequest> {
    const persisted = await this.prisma.viewerChzzkMigrationRequest.upsert({
      where: { id: migration.id },
      create: {
        id: migration.id,
        twitchId: migration.twitchId,
        twitchUsername: migration.twitchUsername,
        chzzkId: migration.chzzkId,
        chzzkUsername: migration.chzzkUsername,
        migrated: migration.migrated,
      },
      update: {
        twitchId: migration.twitchId,
        twitchUsername: migration.twitchUsername,
        chzzkId: migration.chzzkId,
        chzzkUsername: migration.chzzkUsername,
        migrated: migration.migrated,
      },
    });

    return new ViewerChzzkMigrationRequest(persisted);
  }

  async findOneMigration(migrationId: string): Promise<ViewerChzzkMigrationRequest | null> {
    const persisted = await this.prisma.viewerChzzkMigrationRequest.findUnique({
      where: { id: migrationId },
    });

    if (!persisted) return null;

    return new ViewerChzzkMigrationRequest(persisted);
  }

  private async create(viewer: Viewer): Promise<Viewer> {
    const result = await this.sheets.appendRow(this.sheetsInfo, viewer);

    await this.prisma.biasIdol.createMany({
      data: viewer.viasIdolIds.map((idolId) => ({
        viewerUsername: viewer.username,
        idolId: parseInt(idolId, 10),
      })),
    });

    return convertFromDataModel(result, viewer.viasIdolIds);
  }

  private async getBiasIdolIds(username: string) {
    const biasIdolQuery = await this.prisma.biasIdol.findMany({
      where: { viewerUsername: username },
      orderBy: { createdAt: 'asc' },
    });
    const biasIdolIds = biasIdolQuery.map((query) => query.idolId);

    return biasIdolIds;
  }
}

const convertFromDataModel = (row: ViewerDataModel, viasIdolIds: string[]) => {
  if (!row.username || !row.ticket || !row.ticketPiece) {
    throw new Error(`Essential row was empty: ${JSON.stringify(row)}`);
  }

  return new Viewer({
    id: `${row.index}`,
    twitchId: row.twitchId,
    username: row.username,
    ticket: parseInt(row.ticket, 10),
    ticketPiece: parseInt(row.ticketPiece, 10),
    prefix: row.prefix,
    viasIdolIds,
  });
};

export const ViewersRepositoryProvider = {
  provide: VIEWERS_REPOSITORY,
  useClass: ViewersRepository,
};
