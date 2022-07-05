import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getConfigWithConfigService = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  synchronize: false,
  logging: true,
  entities: ['dist/**/*{.entity.js,.entity.ts}', 'dist/**/*{.datamodel.js,.datamodel.ts}'],
  migrations: ['dist/src/migrations/*{.js,.ts}'],
  subscribers: ['dist/src/subscribers/*{.js,.ts}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
});
