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
