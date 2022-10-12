import { Injectable } from '@nestjs/common';
import { BusinessError, isBusinessError } from 'src/util/business-error';

import { AccountsRepository } from 'src/infrastructure/persistence/accounts/accounts.repository';
import { SongsRepository } from 'src/infrastructure/persistence/songs/songs.repository';
import { ViewersRepository } from 'src/infrastructure/persistence/viewers/viewers.repository';

import { SongsService } from 'src/domain/songs/songs.service';
import { RequestType } from 'src/domain/songs/songs.entity';

@Injectable()
export class SongsApplication {
  private readonly songsService: SongsService;

  constructor(
    private readonly viewersRepository: ViewersRepository,
    private readonly accountsRepository: AccountsRepository,
    private readonly songsRepository: SongsRepository,
  ) {
    this.songsService = new SongsService(songsRepository);
  }

  public async requestSong(twitchId: string, username: string, title: string) {
    const viewer = await this.viewersRepository.findOne(twitchId);
    if (viewer === null) return new BusinessError('no-viewer');

    const account = await this.accountsRepository.findByTwitchIdAndUsername(twitchId, username);
    if (account === null) return new BusinessError('no-account');

    const paymentResult = account.payForRequestSong();
    if (isBusinessError(paymentResult)) return paymentResult;

    const requestType = paymentResult === 'ticket' ? RequestType.ticket : RequestType.ticketPiece;
    const song = await viewer.requestSong(title, requestType, this.songsService);
    if (isBusinessError(song)) return song;

    const [persisted] = await Promise.all([
      await this.songsRepository.save(song),
      await this.accountsRepository.save(account),
    ]);

    return persisted;
  }
}
