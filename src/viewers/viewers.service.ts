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

  async getViewer(twitchId: string, username: string): Promise<Viewer | undefined> {
    const twitchIdViewer = await this.userRepository.findOne({
      where: { twitchId },
    });

    if (twitchIdViewer) {
      if (twitchIdViewer.username !== username) {
        twitchIdViewer.username = username;
        this.userRepository.save(twitchIdViewer);
      }
      return twitchIdViewer;
    }

    const usernameViewer = await this.userRepository.findOne({
      where: { username },
    });
    if (!usernameViewer) {
      return usernameViewer;
    }

    usernameViewer.twitchId = twitchId;
    this.userRepository.save(usernameViewer);

    return usernameViewer;
  }

  getViewerByTwitchId(twitchId: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ where: { twitchId } });
  }

  getViewerByUsername(username: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }
}
