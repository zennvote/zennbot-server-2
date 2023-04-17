import {
  Controller,
  Sse,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { map } from 'rxjs';

import { SongsApplication } from './songs.application';
import Song from './songs.entity';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsApplication: SongsApplication) { }

  @Sse('sse')
  @ApiOkResponse({ type: [Song] })
  getSongsSse() {
    return this.songsApplication.getSongsObserver().pipe(map((data) => JSON.stringify(data)));
  }

  @Sse('cooltimes/sse')
  @ApiOkResponse({ type: [Song] })
  getCooltimeSongsSse() {
    return this.songsApplication
      .getCooltimeSongsObserver()
      .pipe(map((data) => JSON.stringify(data)));
  }
}
