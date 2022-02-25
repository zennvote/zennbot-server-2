import { Controller, Get } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CommandPayload } from 'src/tmi/tmi.interface';
import { ViewersService } from './viewers.service';

@Controller('viewers')
export class ViewersController {
  constructor(private readonly viewersService: ViewersService) {}

  @Get()
  async getViewers() {
    return await this.viewersService.getViewers();
  }

  @OnEvent('command.조각')
  async whoAmICommand(payload: CommandPayload) {
    const twitchId = payload.tags['username'];
    const username = payload.tags['display-name'];

    const viewer = await this.viewersService.getViewer(twitchId, username);

    if (!viewer) {
      return payload.send(`${username}님의 데이터가 존재하지 않습니다!`);
    }

    const { ticket, ticketPiece, prefix } = viewer;
    const formattedPrefix = prefix ? `[${prefix}] ` : '';

    payload.send(`${formattedPrefix}${username} 티켓 ${ticket}장 | 조각${ticketPiece}장 보유중`);
  }
}
