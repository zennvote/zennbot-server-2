import { Injectable } from '@nestjs/common';
import { SheetsService } from 'src/sheets/sheets.service';
import { Viewer } from './viewers.entity';
import { ViewersRepository } from './viewers.repository';

@Injectable()
export class ViewersService {
  constructor(private viewersRepository: ViewersRepository, private readonly sheetsService: SheetsService) {}

  getViewers(): Promise<Viewer[]> {
    return this.viewersRepository.find();
  }

  async getViewer(twitchId: string, username: string): Promise<Viewer | undefined> {
    const twitchIdViewer = await this.viewersRepository.findOne({ twitchId });

    if (twitchIdViewer) {
      if (twitchIdViewer.username !== username) {
        twitchIdViewer.username = username;
        this.viewersRepository.save(twitchIdViewer);
      }
      return twitchIdViewer;
    }

    const usernameViewer = await this.viewersRepository.findOne({ username });
    if (!usernameViewer) {
      return usernameViewer;
    }

    usernameViewer.twitchId = twitchId;
    this.viewersRepository.save(usernameViewer);

    return usernameViewer;
  }

  async setPoints(twitchId: string, points: { ticket?: number; ticketPiece?: number }) {
    this.viewersRepository.update({ twitchId }, points);
  }

  async setPointsWithUsername(username: string, points: { ticket?: number; ticketPiece?: number }) {
    this.viewersRepository.update({ username }, points);
  }

  getViewerByTwitchId(twitchId: string): Promise<Viewer | undefined> {
    return this.viewersRepository.findOne({ twitchId });
  }

  getViewerByUsername(username: string): Promise<Viewer | undefined> {
    return this.viewersRepository.findOne({ username });
  }
}
