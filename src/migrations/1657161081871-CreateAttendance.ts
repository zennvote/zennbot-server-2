import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendance1657161081871 implements MigrationInterface {
  name = 'CreateAttendance1657161081871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "attendance" ("id" SERIAL NOT NULL, "twitchId" character varying NOT NULL, "attendedAt" TIMESTAMP NOT NULL, "tier" integer NOT NULL, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_88afafaccbb967eda0db4d9bd4" ON "attendance" ("twitchId", "attendedAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_88afafaccbb967eda0db4d9bd4"`);
    await queryRunner.query(`DROP TABLE "attendance"`);
  }
}
