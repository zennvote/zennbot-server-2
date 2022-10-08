import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { OnCommand } from 'src/libs/tmi/tmi.decorators';
import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { ManagerChatGuard } from '../managers/guards/manager-chat.guard';

import { Viewer } from './viewers.entity';
import { ViewersService } from './viewers.service';

@Controller('viewers')
export class ViewersController {
  constructor(private readonly viewersService: ViewersService) {}

  @Get()
  @ApiOkResponse({ type: [Viewer] })
  async getViewers() {
    return this.viewersService.getViewers();
  }

  @OnCommand('조각')
  async whoAmICommand(payload: CommandPayload) {
    const twitchId = payload.tags.username;
    const username = payload.tags['display-name'];

    if (!twitchId || !username) {
      return;
    }

    const viewer = await this.viewersService.getViewer(twitchId, username);

    if (!viewer) {
      return payload.send(`${username}님의 데이터가 존재하지 않습니다!`);
    }

    const { ticket, ticketPiece, prefix } = viewer;
    const formattedPrefix = prefix ? `[${prefix}] ` : '';

    payload.send(`${formattedPrefix}${username} 티켓 ${ticket}장 | 조각 ${ticketPiece}장 보유중`);
  }

  @ManagerChatGuard()
  @OnCommand('시청자등록')
  async registerViewer(payload: CommandPayload) {
    const [username, twitchId] = payload.args;

    if (payload.args.length < 1) {
      return payload.send('시청자 이름을 입력해주세요!');
    }

    const viewerFetcher = twitchId
      ? () => this.viewersService.getViewer(twitchId, username)
      : () => this.viewersService.getViewerByUsername(username);

    const viewer = await viewerFetcher();
    if (viewer) {
      return payload.send('이미 유저가 존재합니다!');
    }

    await this.viewersService.createViewer(username, twitchId);

    return payload.send(`새로운 시청자 ${username}님이 등록되었습니다!`);
  }

  @ManagerChatGuard()
  @OnCommand('지급')
  async givePointCommand(payload: CommandPayload) {
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
      await this.viewersService.setPointsWithUsername(
        name,
        { ticket: viewer.ticket + point },
      );
    } else {
      await this.viewersService.setPointsWithUsername(
        name,
        { ticketPiece: viewer.ticketPiece + point },
      );
    }

    if (point < 0) {
      payload.send(`${name}님의 ${inputType} ${-point}개를 차감하였습니다.`);
    } else {
      payload.send(`${name}님에게 ${inputType} ${point}개를 지급하였습니다.`);
    }
  }
}
