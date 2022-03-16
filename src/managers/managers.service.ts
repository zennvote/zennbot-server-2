import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateManagerDto } from './dto/create-manager.dto';
import { Manager } from './managers.entity';

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(Manager)
    private managerRepository: Repository<Manager>,
  ) {}

  async getManagers() {
    return this.managerRepository.find();
  }

  async createManager(createManagerDto: CreateManagerDto) {
    const manager = new Manager();
    manager.twitchId = createManagerDto.twitchId;

    return await this.managerRepository.save(manager);
  }

  async deleteManager(twitchId: string) {
    await this.managerRepository.delete({ twitchId });
  }

  async isManager(twitchId: string) {
    return (await this.managerRepository.count({ twitchId })) > 0;
  }
}
