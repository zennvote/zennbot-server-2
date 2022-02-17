import { Controller, Get } from '@nestjs/common';
import { ViewersService } from './viewers.service';

@Controller('viewers')
export class ViewersController {
  constructor(private readonly viewersService: ViewersService) {}

  @Get()
  async getViewers() {
    return await this.viewersService.getViewers();
  }
}
