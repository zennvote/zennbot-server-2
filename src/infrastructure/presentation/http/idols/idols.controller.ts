import { Controller, Get } from '@nestjs/common';

import { IdolsApplication } from 'src/application/idols/idols.application';

@Controller('idols')
export class IdolsController {
  constructor(
    private readonly application: IdolsApplication,
  ) {}

  @Get()
  public async getIdols() {
    return this.application.queryIdols();
  }
}
