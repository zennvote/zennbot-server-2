import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AttendancesApplication } from './attendances.application';
import { AttendDto } from './dtos/attend.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesApplication: AttendancesApplication) {}

  @OnEvent('subscriber-chat')
  async onSubscriberChat(payload: AttendDto) {
    await this.attendancesApplication.attend(payload);
  }
}
