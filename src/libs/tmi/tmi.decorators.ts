import { OnEvent } from '@nestjs/event-emitter';

export const OnCommand = (command: string) => OnEvent(`command.${command}`);
