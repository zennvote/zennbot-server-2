import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('versions')
  getVersion() {
    return process.env.VERSION;
  }
}
