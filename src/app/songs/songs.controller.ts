import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { map } from 'rxjs';

import { isBusinessError } from 'src/util/business-error';

import { JwtAuthGuard } from 'src/app/auth/guards/jwt-auth.guard';

import { SongsApplication } from './songs.application';
import Song from './songs.entity';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsApplication: SongsApplication) { }

  @Get()
  @ApiOkResponse({ type: [Song] })
  async getSongs() {
    return this.songsApplication.getSongs();
  }

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

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiCreatedResponse({ type: Song })
  async createSong(@Body('title') title: string) {
    return this.songsApplication.createSongManually(title);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cooltimes')
  async deleteCooltimeSongs() {
    return this.songsApplication.resetCooltimeSongs();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':index')
  async deleteSong(@Param('index') indexStr: string, @Query('refund') refundStr: string) {
    const isRefund = refundStr !== undefined;
    const index = parseInt(indexStr, 10);

    if (Number.isNaN(index) || index < 0) {
      throw new BadRequestException();
    }

    const result = await this.songsApplication.deleteSong(index, isRefund);
    if (isBusinessError(result)) {
      switch (result.error) {
        case 'viewer-not-exists':
          throw new NotFoundException();
        case 'out-of-range':
          throw new BadRequestException();
        default:
          throw new InternalServerErrorException();
      }
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('skip')
  @ApiOkResponse({ type: Song })
  async skipSong() {
    const result = await this.songsApplication.skipSong();
    if (isBusinessError(result)) {
      throw new BadRequestException();
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reindex')
  @ApiOkResponse({ type: [Song] })
  async reindexSongs(@Body() indexes: number[]) {
    const result = await this.songsApplication.reindexSongs(indexes);

    if (isBusinessError(result)) {
      throw new BadRequestException();
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  @ApiOkResponse()
  async resetSongs() {
    return this.songsApplication.resetRequestedSongs();
  }

  @Get('cooltimes')
  @ApiOkResponse({ type: [Song] })
  async getCooltimeSongs() {
    return this.songsApplication.getCooltimeSongs();
  }
}
