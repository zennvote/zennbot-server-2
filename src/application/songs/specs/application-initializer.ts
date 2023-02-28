/* eslint-disable no-param-reassign */
import { ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

import { MockSongQueueRepository } from 'src/infrastructure/persistence/songs/song-queue.mock';
import { MockSongRequestorRepository } from 'src/infrastructure/persistence/songs/song-requestor.mock';
import { MockSongsRepository } from 'src/infrastructure/persistence/songs/songs.mock';

import { SongsApplication } from '../songs.application';

export type BaseTestContenxt = {
  sandbox: SinonSandbox;

  application: SongsApplication;

  songsRepository: MockSongsRepository;
  songQueueRepository: MockSongQueueRepository;
  songRequestorRepository: MockSongRequestorRepository;
}

export const baseSetup = (test: ExecutionContext<BaseTestContenxt>) => {
  const sandbox = sinon.createSandbox();

  test.context.sandbox = sandbox;
  test.context.songsRepository = new MockSongsRepository(sandbox);
  test.context.songQueueRepository = new MockSongQueueRepository(sandbox);
  test.context.songRequestorRepository = new MockSongRequestorRepository(sandbox);

  test.context.application = new SongsApplication(
    test.context.songsRepository,
    test.context.songQueueRepository,
    test.context.songRequestorRepository,
  );
};
