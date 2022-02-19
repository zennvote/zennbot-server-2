import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Viewer } from './viewers.entity';

@Injectable()
export class ViewersService {
  constructor(
    @InjectRepository(Viewer)
    private userRepository: Repository<Viewer>,
  ) {}

  getViewers(): Promise<Viewer[]> {
    return this.userRepository.find();
  }

  getViewerByTwitchId(twitchId: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ where: { twitchId } });
  }

  getViewerByUsername(username: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }
}
