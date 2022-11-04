import {
  Controller, Get, NotFoundException, Param, ParseIntPipe,
} from '@nestjs/common';

import { isBusinessError } from 'src/util/business-error';

import { ViewersApplication } from 'src/application/viewers/viewers.application';

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
}
