import {
  BadRequestException,
  Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Query, UseGuards,
} from '@nestjs/common';

import { isBusinessError, mapError } from 'src/util/business-error';

import { JwtAuthGuard } from 'src/app/auth/guards/jwt-auth.guard';
import { SongsApplication } from 'src/application/songs/songs.application';

import { Song } from 'src/domain/songs/entities/songs.entity';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsApplication: SongsApplication) {}

  @Get()
  async getSongs(): Promise<Song[]> {
    return this.songsApplication.getSongs();
  }

  @Get('cooltimes')
  async getCooltimes(): Promise<Song[]> {
    return this.songsApplication.getCooltimes();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSong(@Body('title') title: string): Promise<Song> {
    return this.songsApplication.appendManualSong(title);
  }

  @UseGuards(JwtAuthGuard)
  @Post('skip')
  async consumeSong(): Promise<Song> {
    const result = await this.songsApplication.consumeSong();

    if (isBusinessError(result)) throw new BadRequestException(result.error);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reindex')
  async reindexSongs(@Body() indexes: string[]): Promise<Song[]> {
    const result = await this.songsApplication.reindexSongs(indexes);

    if (isBusinessError(result)) throw new BadRequestException(result.error);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  async resetSongs(): Promise<void> {
    return this.songsApplication.resetSongs();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':index')
  async deleteSong(
    @Param('index', ParseIntPipe) index: number,
    @Query('refund') refund: string,
  ): Promise<Song> {
    const isRefund = refund !== undefined;

    const result = await this.songsApplication.deleteSongByIndex(index, isRefund);

    if (isBusinessError(result)) {
      return mapError(result, {
        'out-of-range': new BadRequestException(result.error),
        'requestor-not-found': new NotFoundException(result.error),
      });
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cooltimes')
  async resetCooltimes(): Promise<void> {
    return this.songsApplication.resetCooltimes();
  }
}
