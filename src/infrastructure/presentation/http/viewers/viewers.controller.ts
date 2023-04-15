import {
  Body,
  Controller, Get, NotFoundException, Param, Post,
} from '@nestjs/common';

import { isBusinessError } from 'src/util/business-error';

import { ViewersApplication } from 'src/application/viewers/viewers.application';

import { SetBiasIdolsDto } from './dto/set-bias-diols.dto';

@Controller('viewers')
export class ViewersController {
  constructor(
    private readonly application: ViewersApplication,
  ) {}

  @Get('/:username')
  public async getViewer(
    @Param('username') username: string,
  ) {
    const result = await this.application.queryViewerByUsername(username);

    if (isBusinessError(result)) {
      switch (result.error) {
        case 'no-viewer':
          throw new NotFoundException();
      }
    }

    return result;
  }

  @Post('/:username/bias-idols')
  public async setBiasIdols(
    @Param('username') username: string,
    @Body() setBiasIdolsDto: SetBiasIdolsDto,
  ) {
    const result = await this.application.setBiasIdols(username, setBiasIdolsDto.ids);

    if (isBusinessError(result)) {
      switch (result.error) {
        case 'no-viewer':
          throw new NotFoundException();
      }
    }

    return result;
  }
}
