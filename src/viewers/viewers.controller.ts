import { Controller, Get, Post } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ManagersService } from 'src/managers/managers.service';

import { CommandPayload } from 'src/tmi/tmi.interface';
import { ViewersService } from './viewers.service';

@Controller('viewers')
export class ViewersController {
  constructor(private readonly viewersService: ViewersService, private readonly managersService: ManagersService) {}

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

  @OnEvent('command.지급')
  async givePointCommand(payload: CommandPayload) {
    const twitchId = payload.tags['username'];

    if (!(await this.managersService.isManager(twitchId))) {
      return payload.send('권한이 없습니다!');
    }

    const [inputType, name, inputPoint] = payload.args;

    if (payload.args.length < 2 || Number.isNaN(inputType) || (inputType !== '곡' && inputType !== '조각')) {
      return payload.send('잘못된 명령어 형식입니다. 다시 한번 확인해주세요!');
    }

    const point = parseInt(inputPoint, 10) || 1;

    const viewer = await this.viewersService.getViewerByUsername(name);
    if (!viewer) {
      return payload.send('존재하지 않는 시청자입니다.');
    }

    if (inputType === '곡') {
      await this.viewersService.setPointsWithUsername(name, { ticket: viewer.ticket + point });
    } else {
      await this.viewersService.setPointsWithUsername(name, { ticketPiece: viewer.ticketPiece + point });
    }

    payload.send(`${name}님에게 ${inputType} ${point}개를 지급하였습니다.`);
  }
}
