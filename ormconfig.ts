import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) ?? 5433,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: ['dist/**/*{.entity.js,.entity.ts}', 'dist/**/*{.datamodel.js,.datamodel.ts}'],
  migrations: ['dist/src/migrations/*{.js,.ts}'],
  subscribers: ['dist/src/subscribers/*{.js,.ts}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export const getConfigWithConfigService = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT'), 10) ?? 5433,
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

export default config;
