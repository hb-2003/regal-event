import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingFinalAmount1778935000000 implements MigrationInterface {
  name = "AddBookingFinalAmount1778935000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "final_amount" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "final_amount"`);
  }
}
