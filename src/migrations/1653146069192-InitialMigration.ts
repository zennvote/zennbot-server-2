import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1653146069192 implements MigrationInterface {
  name = 'InitialMigration1653146069192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "manager" ("id" SERIAL NOT NULL, "twitchId" character varying NOT NULL, CONSTRAINT "UQ_f756ed070c041f94fbf92e413e9" UNIQUE ("twitchId"), CONSTRAINT "PK_b3ac840005ee4ed76a7f1c51d01" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "salt" character varying NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "manager"`);
  }
}
