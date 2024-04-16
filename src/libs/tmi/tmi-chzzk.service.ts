import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChzzkChat, ChzzkClient } from 'chzzk';

import { CommandPayload } from './tmi.types';

@Injectable()
export class TmiChzzkService {
  private readonly logger = new Logger('TmiChzzkLogger');

  private readonly botId: string;
  private readonly client: ChzzkClient;
  private readonly chatClient: ChzzkChat;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    configService: ConfigService,
  ) {
    this.client = new ChzzkClient({
      nidAuth: configService.get<string>('CHZZK_NID_AUT'),
      nidSession: configService.get<string>('CHZZK_NID_SES'),
    });
    this.chatClient = this.client.chat({
      channelId: configService.get<string>('CHZZK_CHANNEL_ID'),
    });
    this.botId = configService.get<string>('CHZZK_BOT_ID') ?? '';

    this.chatClient.on('connect', (data) => {
      this.logger.log(`Connected to chat: ${data}`);
    });
    this.chatClient.on('reconnect', (data) => {
      this.logger.log(`Reconnected to chat: ${data}`);
    });
    this.chatClient.on('disconnect', (data) => {
      this.logger.log(`Disconnected from chat: ${data}`);
      this.chatClient.reconnect();
    });

    this.handleCommand();
    this.handleLogChat();

    this.chatClient.connect();
  }

  private handleCommand() {
    this.chatClient.on('chat', (chat) => {
      if (chat.profile.userIdHash === this.botId) return;
      if (!chat.message.startsWith('!')) return;

      // eslint-disable-next-line no-promise-executor-return
      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      const send = async (message: string | string[]) => {
        if (Array.isArray(message)) {
          if (message.length === 0) return;
          if (message.length === 1) return this.chatClient.sendChat(message[0]);

          return message.reduce<Promise<void>>(async (acc, cur, i) => {
            if (i === 0) return Promise.resolve(this.chatClient.sendChat(cur));

            await acc;
            await wait(200);
            return this.chatClient.sendChat(cur);
          }, Promise.resolve());
        }

        return this.chatClient.sendChat(message);
      };
      const message = chat.message.startsWith('!젠 ')
        ? chat.message.replace('젠 ', '')
        : chat.message;

      const command = message.split(' ')[0].slice(1).toLowerCase();
      const [, ...args] = message.split(' ');
      const payload: CommandPayload = {
        channel: 'deprecated',
        tags: {
          'user-id': chat.profile.userIdHash,
          username: chat.profile.nickname,
          'display-name': chat.profile.nickname,
        },
        message,
        args,
        send,
      };

      this.chatClient.on('raw', (raw) => this.logger.debug('CHZZK RECV', raw));
      this.eventEmitter.emit(`command.${command}`, payload);
    });
  }

  private handleLogChat() {
    this.chatClient.on('chat', (chat) => {
      this.logger.debug(`CHZZK CHAT #${chat.time}`, {
        channel: 'deprecated',
        tags: {
          'user-id': chat.profile.userIdHash,
          username: chat.profile.nickname,
          'display-name': chat.profile.nickname,
        },
        message: chat.message,
      });
    });
  }
}
