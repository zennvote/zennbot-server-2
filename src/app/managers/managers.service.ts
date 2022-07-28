import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { Manager } from './managers.entity';

@Injectable()
export class ManagersService {
  constructor(private prisma: PrismaService) {}

  async getManagers() {
    const managers = await this.prisma.manager.findMany();

    return managers.map((manager) => {
      const entity = new Manager();
      entity.id = manager.id;
      entity.twitchId = manager.twitchId;
      return entity;
    });
  }

  async createManager(createManagerDto: CreateManagerDto) {
    const manager = new Manager();
    manager.twitchId = createManagerDto.twitchId;

    return this.prisma.manager.create({ data: manager });
  }

  async deleteManager(twitchId: string) {
    await this.prisma.manager.delete({ where: { twitchId } });
  }

  async isManager(twitchId: string) {
    return (await this.prisma.manager.count({ where: { twitchId } })) > 0;
  }
}
