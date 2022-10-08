import { Factory } from 'fishery';
import { Viewer } from 'src/app/accounts/viewers.entity';
import { CommandPayload } from './tmi.types';

type CommandPayloadTransientParams = {
  sender: Viewer;
}
class CommandPayloadFactory extends Factory<CommandPayload, CommandPayloadTransientParams> {
  sendBy(sender: Viewer) {
    return this.transient({ sender });
  }

  message(message: string) {
    const [, ...args] = message.split(' ');

    return this.params({ message, args });
  }

  mockSend(send: CommandPayload['send']) {
    return this.params({ send });
  }
}

export const commandPayloadFactory = CommandPayloadFactory.define(
  ({ transientParams, params }) => {
    const tags: CommandPayload['tags'] = {
      username: transientParams.sender?.twitchId,
      'display-name': transientParams.sender?.username,
      ...params.tags,
    } as any;

    return {
      channel: 'channel',
      message: '!미등록커맨드',
      args: [],
      send: () => undefined,
      ...params,
      tags,
    };
  },
);
