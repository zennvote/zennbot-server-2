import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSetting1654769036164 implements MigrationInterface {
  name = 'AddSetting1654769036164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "setting" ("key" character varying NOT NULL, "type" character varying NOT NULL, "flagValue" boolean, CONSTRAINT "PK_1c4c95d773004250c157a744d6e" PRIMARY KEY ("key"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "setting"`);
  }
}
