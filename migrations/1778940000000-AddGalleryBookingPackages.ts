import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGalleryBookingPackages1778940000000 implements MigrationInterface {
  name = "AddGalleryBookingPackages1778940000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "description" text`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "price" text`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "availability_status" character varying NOT NULL DEFAULT 'Available'`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "is_popular" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "is_trending" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "inclusions" text`
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gallery_images" (
        "id" SERIAL NOT NULL,
        "gallery_id" integer NOT NULL,
        "image_path" character varying NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_gallery_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gallery_images_gallery" FOREIGN KEY ("gallery_id") REFERENCES "gallery"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "gallery_id" integer`
    );
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "bookings"
          ADD CONSTRAINT "FK_bookings_gallery"
          FOREIGN KEY ("gallery_id") REFERENCES "gallery"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_gallery"`
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN IF EXISTS "gallery_id"`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "gallery_images"`);
    await queryRunner.query(`ALTER TABLE "gallery" DROP COLUMN IF EXISTS "inclusions"`);
    await queryRunner.query(`ALTER TABLE "gallery" DROP COLUMN IF EXISTS "is_trending"`);
    await queryRunner.query(`ALTER TABLE "gallery" DROP COLUMN IF EXISTS "is_popular"`);
    await queryRunner.query(
      `ALTER TABLE "gallery" DROP COLUMN IF EXISTS "availability_status"`
    );
    await queryRunner.query(`ALTER TABLE "gallery" DROP COLUMN IF EXISTS "price"`);
    await queryRunner.query(`ALTER TABLE "gallery" DROP COLUMN IF EXISTS "description"`);
  }
}
