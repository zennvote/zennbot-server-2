import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/sheets/sheets.service';
import { Viewer } from './viewers.entity';
import { ViewersRepository } from './viewers.repository';

@Injectable()
export class ViewersService {
  constructor(private userRepository: ViewersRepository, private readonly sheetsService: SheetsService) {}

  getViewers(): Promise<Viewer[]> {
    return this.userRepository.find();
  }

  async getViewer(twitchId: string, username: string): Promise<Viewer | undefined> {
    const twitchIdViewer = await this.userRepository.findOne({ twitchId });

    if (twitchIdViewer) {
      if (twitchIdViewer.username !== username) {
        twitchIdViewer.username = username;
        this.userRepository.save(twitchIdViewer);
      }
      return twitchIdViewer;
    }

    const usernameViewer = await this.userRepository.findOne({ username });
    if (!usernameViewer) {
      return usernameViewer;
    }

    usernameViewer.twitchId = twitchId;
    this.userRepository.save(usernameViewer);

    return usernameViewer;
  }

  async setPoints(twitchId: string, points: { ticket?: number; ticketPiece?: number }) {
    this.userRepository.update({ twitchId }, points);
  }

  async setPointsWithUsername(username: string, points: { ticket?: number; ticketPiece?: number }) {
    this.userRepository.update({ username }, points);
  }

  getViewerByTwitchId(twitchId: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ twitchId });
  }

  getViewerByUsername(username: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ username });
  }
}
