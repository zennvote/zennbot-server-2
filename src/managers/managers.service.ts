import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async isManager(twitchId: string) {
    return (await this.managerRepository.count({ twitchId })) > 0;
  }
}
