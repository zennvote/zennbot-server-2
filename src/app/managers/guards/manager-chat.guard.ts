import { applyDecorators, SetMetadata } from '@nestjs/common';

export const MANAGER_CHAT_GUARD_METADATA = 'MANAGER_CHAT_GUARD_METADATA';

export const ManagerChatGuard = (): MethodDecorator => {
  return applyDecorators(SetMetadata(MANAGER_CHAT_GUARD_METADATA, true));
};
