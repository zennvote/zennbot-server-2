import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandPayload } from 'src/tmi/tmi.interface';

@Controller('idols')
export class IdolsController {
  @OnEvent('command.아이돌')
  async searchIdol(payload: CommandPayload) {}
}
