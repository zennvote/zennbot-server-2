import { Injectable } from '@nestjs/common';
import { Song as SongDataModel } from '@prisma/client';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { RequestType, Song } from 'src/domain/songs/entities/songs.entity';
import { SongsRepository as SongsRepositoryInterface } from 'src/domain/songs/songs.repository';

@Injectable()
export class SongsRepository implements SongsRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async save(song: Song): Promise<Song> {
    if (!song.persisted) return this.create(song);

    const existing = await this.prisma.song.findUnique({ where: { id: song.id } });
    if (!existing) throw new Error('saving song not found');

    const consumedAt = song.consumed ? (existing.consumedAt ?? new Date()) : null;

    const result = await this.prisma.song.update({
      data: {
        title: song.title,
        requestorId: song.requestorId,
        requestType: song.requestType,
        consumedAt,
        displayOrder: song.consumed ? -1 : undefined,
      },
      where: { id: song.id },
    });

    return convertFromDataModel(result);
  }

  async create(song: Song): Promise<Song> {
    const displayOrderQuery = await this.prisma.song.aggregate({
      _max: { displayOrder: true },
    });
    const displayOrder = (displayOrderQuery._max.displayOrder ?? 0) + 1;

    const result = await this.prisma.song.create({
      data: {
        title: song.title,
        requestorId: song.requestorId,
        requestType: song.requestType,
        displayOrder,
        consumedAt: song.consumed ? new Date() : null,
      },
    });

    return convertFromDataModel(result);
  }

  async getRequestedSongs(): Promise<Song[]> {
    const result = await this.prisma.song.findMany({
      where: { consumedAt: null },
      orderBy: { displayOrder: 'asc' },
    });

    return result.map(convertFromDataModel);
  }

  async getCooltimeSongs(): Promise<Song[]> {
    const result = await this.prisma.song.findMany({
      where: { NOT: { consumedAt: null } },
      take: 4,
      orderBy: { consumedAt: 'desc' },
    });

    return result.map(convertFromDataModel).reverse();
  }
}

const convertFromDataModel = (datamodel: SongDataModel) => new Song({
  id: datamodel.id,
  title: datamodel.title,
  consumed: datamodel.consumedAt !== null,
  requestorId: datamodel.requestorId,
  requestType: datamodel.requestType as RequestType,
});
