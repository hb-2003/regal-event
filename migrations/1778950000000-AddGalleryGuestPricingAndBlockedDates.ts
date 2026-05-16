import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGalleryGuestPricingAndBlockedDates1778950000000
  implements MigrationInterface
{
  name = "AddGalleryGuestPricingAndBlockedDates1778950000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "guest_pricing_enabled" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "require_guest_count" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "base_guest_capacity" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "extra_guest_cost" numeric(10,2)`
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gallery_blocked_dates" (
        "id" SERIAL NOT NULL,
        "gallery_id" integer NOT NULL,
        "blocked_date" date NOT NULL,
        CONSTRAINT "PK_gallery_blocked_dates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_gallery_blocked_date" UNIQUE ("gallery_id", "blocked_date"),
        CONSTRAINT "FK_gallery_blocked_dates_gallery" FOREIGN KEY ("gallery_id") REFERENCES "gallery"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "gallery_blocked_dates"`);
    await queryRunner.query(
      `ALTER TABLE "gallery" DROP COLUMN IF EXISTS "extra_guest_cost"`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" DROP COLUMN IF EXISTS "base_guest_capacity"`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" DROP COLUMN IF EXISTS "require_guest_count"`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" DROP COLUMN IF EXISTS "guest_pricing_enabled"`
    );
  }
}
