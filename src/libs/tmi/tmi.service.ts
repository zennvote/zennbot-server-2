import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client } from 'tmi.js';
import { TMI_CLIENT } from './tmi.types';

@Injectable()
export class TmiService {
  constructor(@Inject(TMI_CLIENT) private client: Client, private eventEmitter: EventEmitter2) {
    client.on('message', (channel, tags, fullMessage, self) => {
      const sendAt = tags['tmi-sent-ts'] ? new Date(parseInt(tags['tmi-sent-ts'], 10)) : new Date();
      if (self) {
        return;
      }

      if (fullMessage.startsWith('!')) {
        const message = fullMessage.startsWith('!젠 ') ? fullMessage.replace('젠 ', '') : fullMessage;

        const [unformattedCommand, ...args] = message.split(' ');
        const command = unformattedCommand.slice(1);

        this.eventEmitter.emit(`command.${command}`, {
          channel,
          tags,
          args,
          message,
          send: (message: string) => this.client.say(channel, message),
        });
      }

      if (tags.subscriber) {
        const subsciription = parseInt(tags.badges?.subscriber ?? '0', 10);

        let tier = 1;
        if (subsciription >= 3000) {
          tier = 3;
        } else if (subsciription >= 2000) {
          tier = 2;
        }

        console.log('CHAT', {
          twitchId: tags.username,
          username: tags['display-name'],
          tier,
          subsciription: tags.badges?.subscriber,
          sendAt,
          channel,
        });

        this.eventEmitter.emit('subscriber-chat', {
          twitchId: tags.username,
          username: tags['display-name'],
          tier,
          attendedAt: sendAt,
        });
      }
    });
  }

  sendMessaage(channel: string, message: string) {
    this.client.say(channel, message);
  }
}
