import { ChatUserstate } from 'tmi.js';

export const TMI_CLIENT = 'TMI_CLIENT';

export interface CommandPayload {
  channel: string;
  tags: ChatUserstate;
  args: string[];
  message: string;
  send: (message: string) => void;
}

export interface SubscriberChatPayload {
  twitchId: string;
  username: string;
  attendedAt: Date;
  send: (message: string) => void;
}
