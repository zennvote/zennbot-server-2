import { Injectable } from '@nestjs/common';
import { Viewer } from './viewers.entity';
import { ViewersRepository } from './viewers.repository';

@Injectable()
export class ViewersService {
  constructor(private viewersRepository: ViewersRepository) {}

  getViewers(): Promise<Viewer[]> {
    return this.viewersRepository.find();
  }

  async getViewer(twitchId: string, username: string): Promise<Viewer | undefined> {
    const twitchIdViewer = await this.viewersRepository.findOne({ twitchId });

    if (twitchIdViewer) {
      if (twitchIdViewer.username !== username) {
        this.viewersRepository.update({ index: twitchIdViewer.index }, { username });
      }
      return twitchIdViewer;
    }

    const usernameViewer = await this.viewersRepository.findOne({ username });
    if (!usernameViewer) {
      return undefined;
    }

    this.viewersRepository.update({ index: usernameViewer.index }, { twitchId });

    return usernameViewer;
  }

  async setPoints(twitchId: string, username: string, points: { ticket?: number; ticketPiece?: number }) {
    const twitchIdResult = await this.setPointsWithTwitchId(twitchId, points);
    if (twitchIdResult) {
      return twitchIdResult;
    }

    return await this.setPointsWithUsername(username, points);
  }

  async setPointsWithTwitchId(twitchId: string, points: { ticket?: number; ticketPiece?: number }) {
    return await this.viewersRepository.update({ twitchId }, points);
  }

  async setPointsWithUsername(username: string, points: { ticket?: number; ticketPiece?: number }) {
    return await this.viewersRepository.update({ username }, points);
  }

  getViewerByTwitchId(twitchId: string): Promise<Viewer | undefined> {
    return this.viewersRepository.findOne({ twitchId });
  }

  getViewerByUsername(username: string): Promise<Viewer | undefined> {
    return this.viewersRepository.findOne({ username });
  }
}
