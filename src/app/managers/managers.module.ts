import {
  DiscoveryModule, DiscoveryService, MetadataScanner, Reflector,
} from '@nestjs/core';
import { DynamicModule, Module, OnApplicationBootstrap } from '@nestjs/common';

import { CommandPayload } from 'src/libs/tmi/tmi.types';

import { MANAGER_CHAT_GUARD_METADATA } from './guards/manager-chat.guard';

import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';

@Module({
  imports: [DiscoveryModule],
  providers: [ManagersService],
  exports: [ManagersService],
  controllers: [ManagersController],
})
export class ManagerModule implements OnApplicationBootstrap {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly managersService: ManagersService,
  ) {}

  static forRoot(): DynamicModule {
    return {
      module: ManagerModule,
      global: true,
    };
  }

  onApplicationBootstrap() {
    const controllers = this.discovery.getControllers();
    controllers
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter(({ instance }) => instance && Object.getPrototypeOf(instance))
      .forEach(({ instance }) => this.scanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        this.registerManagerAuth(instance),
      ));
  }

  registerManagerAuth(instance: any) {
    return (methodName: string) => {
      const metadata = this.reflector.get(MANAGER_CHAT_GUARD_METADATA, instance[methodName]);
      if (!metadata) {
        return;
      }

      const methodRef = instance[methodName];
      const originMethod = (...args: unknown[]) => methodRef.call(instance, ...args);

      // eslint-disable-next-line no-param-reassign
      instance[methodName] = async (...args: unknown[]) => {
        const [payload] = args as [CommandPayload | undefined, ...unknown[]];

        if (payload?.send) {
          if (!payload.tags.username) {
            return;
          }

          const isManager = await this.managersService.isManager(payload.tags.username);
          if (!isManager) {
            payload.send('권한이 없습니다!');
            return;
          }
        }

        return originMethod(...args);
      };
    };
  }
}
