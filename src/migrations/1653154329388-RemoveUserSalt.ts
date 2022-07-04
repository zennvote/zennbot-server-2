import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserSalt1653154329388 implements MigrationInterface {
  name = 'RemoveUserSalt1653154329388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "salt"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "salt" character varying NOT NULL`);
  }
}
