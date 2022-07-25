import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client } from 'tmi.js';
import { TMI_CLIENT } from './tmi.types';

@Injectable()
export class TmiService {
  constructor(@Inject(TMI_CLIENT) private client: Client, private eventEmitter: EventEmitter2) {
    client.on('message', (channel, tags, fullMessage, self) => {
      if (self) {
        return;
      }

      const sendAt = tags['tmi-sent-ts'] ? new Date(parseInt(tags['tmi-sent-ts'], 10)) : new Date();
      const send = (message: string) =>
        this.client.raw(`@reply-parent-msg-id=${tags.id} PRIVMSG ${channel} :${message}`);

      if (fullMessage.startsWith('!')) {
        const message = fullMessage.startsWith('!젠 ') ? fullMessage.replace('젠 ', '') : fullMessage;

        const [unformattedCommand, ...args] = message.split(' ');
        const command = unformattedCommand.slice(1);

        this.eventEmitter.emit(`command.${command}`, {
          channel,
          tags,
          args,
          message,
          send,
        });
      }

      if (tags.subscriber) {
        this.eventEmitter.emit('subscriber-chat', {
          twitchId: tags.username,
          username: tags['display-name'],
          attendedAt: sendAt,
          send,
        });
      }
    });
  }

  sendMessaage(channel: string, message: string) {
    this.client.say(channel, message);
  }
}
