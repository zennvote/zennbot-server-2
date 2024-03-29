import {
  Controller, Get, Param, UseGuards,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { SubscriberChatPayload } from 'src/libs/tmi/tmi.types';

import { isBusinessError } from 'src/util/business-error';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AttendancesApplication } from './attendances.application';
import { AttendDto } from './dtos/attend.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesApplication: AttendancesApplication) {}

  @OnEvent('subscriber-chat')
  async onSubscriberChat(payload: SubscriberChatPayload) {
    const dto = new AttendDto();
    dto.twitchId = payload.twitchId;
    dto.username = payload.username;
    dto.attendedAt = payload.attendedAt;

    const result = await this.attendancesApplication.attend(dto);

    if (isBusinessError(result)) {
      return;
    }

    payload.send(`@${result.twitchId} 님에게 ${result.tier}티어 출석 보상이 지급되었습니다!`);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAttendances() {
    const result = await this.attendancesApplication.getAttendances();

    return result;
  }

  @Get(':broadcasted_at')
  @UseGuards(JwtAuthGuard)
  async getAttendanceOfBroadcast(@Param('broadcasted_at') broadcastedAt: string) {
    const result = await this.attendancesApplication.getAttendanceOfBroadcast(broadcastedAt);

    return result;
  }
}
