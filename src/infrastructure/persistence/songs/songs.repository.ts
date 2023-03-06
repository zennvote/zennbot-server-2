import { Injectable } from '@nestjs/common';
import { Song as SongDataModel, Prisma } from '@prisma/client';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { RequestType, Song } from 'src/domain/songs/entities/songs.entity';
import { SONG_REPOSITORY, SongsRepository as SongsRepositoryInterface } from 'src/domain/songs/repositories/songs.repository';

@Injectable()
export class SongsRepository implements SongsRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async save(song: Song): Promise<Song> {
    const body: Omit<Prisma.SongCreateInput, 'id'> = {
      title: song.title,
      requestorName: song.requestorName,
      requestType: song.requestType,
    };

    const result = await this.prisma.song.upsert({
      where: { id: song.id },
      create: {
        id: song.id,
        ...body,
      },
      update: body,
    });

    return this.convertFromDataModel(result);
  }

  private convertFromDataModel(datamodel: SongDataModel) {
    return new Song({
      id: datamodel.id,
      title: datamodel.title,
      requestorName: datamodel.requestorName,
      requestType: datamodel.requestType as RequestType,
    });
  }
}

export const SongsRepositoryProvider = {
  provide: SONG_REPOSITORY,
  useClass: SongsRepository,
};
