import { Injectable } from '@nestjs/common';

import { BusinessError } from 'src/util/business-error';

import { RequestType } from 'src/app/songs/songs.entity';

import { Viewer } from './viewers.entity';
import { ViewersRepository } from './viewers.repository';

@Injectable()
export class ViewersService {
  constructor(private viewersRepository: ViewersRepository) { }

  getViewers() {
    return this.viewersRepository.find();
  }

  async getViewer(twitchId: string, username: string) {
    const twitchIdViewer = await this.viewersRepository.findOne({ twitchId });

    if (twitchIdViewer) {
      if (twitchIdViewer.username !== username) {
        // TODO: ID 불일치에 대한 갱신을 중단. twitchId가 chzzk migration metadata로 사용되고 있음.
        // this.viewersRepository.update({ index: twitchIdViewer.index }, { username });
      }
      return twitchIdViewer;
    }

    const usernameViewer = await this.viewersRepository.findOne({ username });
    if (!usernameViewer) {
      return null;
    }

    this.viewersRepository.update({ index: usernameViewer.index }, { twitchId });

    return usernameViewer;
  }

  async createViewer(username: string, twitchId?: string) {
    const viewer = new Viewer({
      index: 0,
      ticket: 1,
      ticketPiece: 3,
      username,
      twitchId,
    });

    await this.viewersRepository.create(viewer);
  }

  async setPoints(
    twitchId: string,
    username: string,
    points: { ticket?: number; ticketPiece?: number },
  ) {
    const twitchIdResult = await this.setPointsWithTwitchId(twitchId, points);
    if (twitchIdResult) {
      return twitchIdResult;
    }

    return this.setPointsWithUsername(username, points);
  }

  async refundPoints(twitchId: string, requestType: RequestType.ticket | RequestType.ticketPiece) {
    const viewer = await this.viewersRepository.findOne({ twitchId });
    if (!viewer) {
      return new BusinessError('viewer-not-exists');
    }

    if (requestType === RequestType.ticket) {
      await this.viewersRepository.update({ twitchId }, { ticket: viewer.ticket + 1 });
    } else {
      await this.viewersRepository.update({ twitchId }, { ticketPiece: viewer.ticketPiece + 3 });
    }
  }

  async payForSongRequest(viewer: Viewer) {
    const { index, ticket, ticketPiece } = viewer;

    if (ticket >= 1) {
      await this.viewersRepository.update({ index }, { ticket: ticket - 1 });
      return RequestType.ticket;
    } if (ticketPiece >= 3) {
      await this.viewersRepository.update({ index }, { ticketPiece: ticketPiece - 3 });
      return RequestType.ticketPiece;
    }
    return new BusinessError('no-points');
  }

  async setPointsWithTwitchId(twitchId: string, points: { ticket?: number; ticketPiece?: number }) {
    return this.viewersRepository.update({ twitchId }, points);
  }

  async setPointsWithUsername(username: string, points: { ticket?: number; ticketPiece?: number }) {
    return this.viewersRepository.update({ username }, points);
  }

  getViewerByTwitchId(twitchId: string) {
    return this.viewersRepository.findOne({ twitchId });
  }

  getViewerByUsername(username: string) {
    return this.viewersRepository.findOne({ username });
  }
}
