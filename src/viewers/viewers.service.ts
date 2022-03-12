import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SheetsService } from 'src/sheets/sheets.service';
import { Repository } from 'typeorm';
import { Viewer } from './viewers.entity';

@Injectable()
export class ViewersService {
  constructor(
    @InjectRepository(Viewer)
    private userRepository: Repository<Viewer>,
    private readonly sheetsService: SheetsService,
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

  async setPoints(twitchId: string, points: { ticket?: number; ticketPiece?: number }) {
    this.userRepository.update({ twitchId }, points);
  }

  async setPointsWithUsername(username: string, points: { ticket?: number; ticketPiece?: number }) {
    this.userRepository.update({ username }, points);
  }

  getViewerByTwitchId(twitchId: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ where: { twitchId } });
  }

  getViewerByUsername(username: string): Promise<Viewer | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async migrateFromSheets() {
    const sheetsRows = await this.sheetsService.getSheets();
    const uniqueRows = sheetsRows.filter(
      (row, index) => sheetsRows.findIndex((innerRow) => row.username === innerRow.username) === index,
    );
    const viewers = uniqueRows.map((row) => {
      const viewer = new Viewer();
      viewer.username = row.username;
      viewer.ticket = row.ticket;
      viewer.ticketPiece = row.ticketPiece;
      if (row.etc) {
        viewer.prefix = row.etc;
      }
      return viewer;
    });

    console.log(await this.userRepository.upsert(viewers, ['username']));
  }
}
