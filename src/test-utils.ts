import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { createConnection } from 'typeorm';

export const createTestDbConnection = (entities: TypeOrmModuleOptions['entities']) =>
  createConnection({
    type: 'sqlite',
    database: ':memory:',
    entities,
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
