import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client } from 'tmi.js';
import { TMI_CLIENT } from './tmi.types';

@Injectable()
export class TmiService {
  constructor(@Inject(TMI_CLIENT) private client: Client, private eventEmitter: EventEmitter2) {
    client.on('message', (channel, tags, fullMessage, self) => {
      if (self || !fullMessage.startsWith('!')) {
        return;
      }
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
    });
  }

  sendMessaage(channel: string, message: string) {
    this.client.say(channel, message);
  }
}
