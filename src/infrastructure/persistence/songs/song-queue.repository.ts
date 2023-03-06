import { Injectable } from '@nestjs/common';
import { SongQueue as SongQueueDataModel, Song as SongDataModel } from '@prisma/client';

import { PrismaService } from 'src/libs/prisma/prisma.service';

import { RequestType } from 'src/app/songs/songs.entity';

import { SongQueue } from 'src/domain/songs/entities/song-queue.entity';
import { Song } from 'src/domain/songs/entities/songs.entity';
import { SONG_QUEUE_REPOSITORY, SongQueueRepository as SongQueueRepositoryInterface } from 'src/domain/songs/repositories/song-queue.repository';

@Injectable()
export class SongQueueRepository implements SongQueueRepositoryInterface {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async get(): Promise<SongQueue> {
    const datamodel = await this.prisma.songQueue.findFirst();
    if (!datamodel) throw new Error('song-queue not found');

    const requestedSongs = await this.prisma.song.findMany({
      where: { id: { in: datamodel.requestedSongs } },
    });
    const consumedSongs = await this.prisma.song.findMany({
      where: { id: { in: datamodel.consumedSongs } },
    });

    return this.convertFromDataModel(datamodel, requestedSongs, consumedSongs);
  }

  async save(songQueue: SongQueue): Promise<SongQueue> {
    const updated = await this.prisma.songQueue.update({
      where: { id: songQueue.id },
      data: {
        requestedSongs: songQueue.requestedSongs.map((song) => song.id),
        consumedSongs: songQueue.consumedSongs.map((song) => song.id),
        isRequestEnabled: songQueue.isRequestEnabled,
        isGoldenBellEnabled: songQueue.isGoldenBellEnabled,
      },
    });

    return this.convertFromDataModel(updated, songQueue.requestedSongs, songQueue.consumedSongs);
  }

  private convertFromDataModel(
    datamodel: SongQueueDataModel,
    requestedSongs: (SongDataModel | Song)[],
    consumedSongs: (SongDataModel | Song)[],
  ) {
    const convertSongs = (songs: (SongDataModel | Song)[]) => songs.map((song) => (
      song instanceof Song ? song : new Song({
        id: song.id,
        title: song.title,
        requestorName: `${song.requestorName}`,
        requestType: song.requestType as RequestType,
      })
    ));

    return new SongQueue({
      id: datamodel.id,
      requestedSongs: convertSongs(requestedSongs),
      consumedSongs: convertSongs(consumedSongs),
      isRequestEnabled: datamodel.isRequestEnabled,
      isGoldenBellEnabled: datamodel.isGoldenBellEnabled,
    });
  }
}

export const SongQueueRepositoryProvider = {
  provide: SONG_QUEUE_REPOSITORY,
  useClass: SongQueueRepository,
};
