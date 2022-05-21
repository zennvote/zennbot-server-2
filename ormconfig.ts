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
  migrations: ['dist/migrations/*{.js,.ts}'],
  subscribers: ['dist/subscribers/*{.js,.ts}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default config;
