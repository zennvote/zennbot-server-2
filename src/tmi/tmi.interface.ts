import { ChatUserstate } from 'tmi.js';

export interface CommandPayload {
  channel: string;
  tags: ChatUserstate;
  args: string[];
  message: string;
  send: (message: string) => void;
}
