import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { ManagerChatGuard } from '../managers/guards/manager-chat.guard';

import { Viewer } from './entities/viewer.entity';
import { ViewersService } from './viewers.service';

@Controller('viewers')
export class ViewersController {
  constructor(private readonly viewersService: ViewersService) {}

  @Get()
  @ApiOkResponse({ type: [Viewer] })
  async getViewers() {
    return this.viewersService.getViewers();
  }
}
