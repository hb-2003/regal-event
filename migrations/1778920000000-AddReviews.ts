import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviews1778920000000 implements MigrationInterface {
  name = "AddReviews1778920000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "review_invites" (
        "id" SERIAL NOT NULL,
        "booking_id" character varying NOT NULL,
        "token" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "sent_at" TIMESTAMP NOT NULL,
        "used_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_review_invites_booking" UNIQUE ("booking_id"),
        CONSTRAINT "UQ_review_invites_token" UNIQUE ("token"),
        CONSTRAINT "PK_review_invites" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" SERIAL NOT NULL,
        "booking_id" character varying,
        "client_name" character varying NOT NULL,
        "client_location" text,
        "event_title" character varying NOT NULL,
        "event_year" integer NOT NULL,
        "rating" integer NOT NULL DEFAULT 5,
        "review_text" text NOT NULL,
        "detail" text,
        "status" character varying NOT NULL DEFAULT 'pending',
        "admin_notes" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "submitted_at" TIMESTAMP,
        "moderated_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_status" ON "reviews" ("status")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_status"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "review_invites"`);
  }
}
