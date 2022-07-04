import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateManagerDto } from './dto/create-manager.dto';
import { Manager } from './managers.entity';
import { ManagersService } from './managers.service';

@UseGuards(JwtAuthGuard)
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get()
  @ApiOkResponse({ type: [Manager] })
  async getManagers() {
    return await this.managersService.getManagers();
  }

  @Post()
  @ApiCreatedResponse({ type: Manager })
  async createManager(@Body() body: CreateManagerDto) {
    return await this.managersService.createManager(body);
  }

  @Delete(':twitchId')
  async deleteManager(@Param('twitchId') twitchId: string) {
    return await this.managersService.deleteManager(twitchId);
  }
}
