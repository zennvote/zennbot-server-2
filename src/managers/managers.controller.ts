import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateManagerDto } from './dto/create-manager.dto';
import { ManagersService } from './managers.service';

@UseGuards(JwtAuthGuard)
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get()
  async getManagers() {
    return await this.managersService.getManagers();
  }

  @Post()
  async createManager(@Body() body: CreateManagerDto) {
    return await this.managersService.createManager(body);
  }

  @Delete(':twitchId')
  async deleteManager(@Param('twitchId') twitchId: string) {
    return await this.managersService.deleteManager(twitchId);
  }
}
