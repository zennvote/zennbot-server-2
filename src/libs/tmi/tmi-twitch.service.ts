import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client } from 'tmi.js';

import { MainLogger } from 'src/util/logger';

import { CommandPayload, TMI_CLIENT } from './tmi.types';

@Injectable()
export class TmiTwitchService {
  private readonly logger = new MainLogger('TmiLogger');

  constructor(@Inject(TMI_CLIENT) private client: Client, private eventEmitter: EventEmitter2) {
    this.logChat();
    this.handleCommand();
    this.handleSubscriberChat();
  }

  private logChat() {
    this.client.on('message', (channel, tags, message, self) => {
      if (self) return;

      this.logger.http(`Chat #${tags.id}`, {
        channel,
        tags,
        message,
        displayName: tags['display-name'],
        username: tags.username,
        userId: tags['user-id'],
      });
    });
  }

  private handleCommand() {
    this.client.on('message', (channel, tags, message, self) => {
      if (self) return;
      if (!message.startsWith('!')) return;

      const send = (message: string | string[]) => this.client.say(channel, Array.isArray(message) ? message.join(' ') : message);
      if (message.startsWith('!젠 ')) {
        // eslint-disable-next-line no-param-reassign
        message = message.replace('젠 ', '');
      }

      const command = message.split(' ')[0].slice(1).toLowerCase();
      const [, ...args] = message.split(' ');
      const payload: CommandPayload = {
        channel,
        tags,
        message,
        args,
        send,
      };

      this.eventEmitter.emit(`command.${command}`, payload);
    });
  }

  private handleSubscriberChat() {
    this.client.on('message', (channel, tags, message, self) => {
      if (self) return;
      if (!tags.subscriber) return;

      const sentAt = tags['tmi-sent-ts'] ? new Date(parseInt(tags['tmi-sent-ts'], 10)) : new Date();
      const send = (message: string) => this.client.say(channel, message);

      this.eventEmitter.emit('subscriber-chat', {
        twitchId: tags.username,
        username: tags['display-name'],
        attendedAt: sentAt,
        send,
      });
    });
  }
}
