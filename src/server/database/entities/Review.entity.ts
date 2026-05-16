import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type ReviewStatus = "pending" | "approved" | "rejected";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "booking_id", type: "varchar", nullable: true })
  booking_id!: string | null;

  @Column({ name: "client_name" })
  client_name!: string;

  @Column({ name: "client_location", type: "text", nullable: true })
  client_location!: string | null;

  @Column({ name: "event_title" })
  event_title!: string;

  @Column({ name: "event_year", type: "int" })
  event_year!: number;

  @Column({ type: "int", default: 5 })
  rating!: number;

  @Column({ name: "review_text", type: "text" })
  review_text!: string;

  @Column({ type: "text", nullable: true })
  detail!: string | null;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: ReviewStatus;

  @Column({ name: "admin_notes", type: "text", nullable: true })
  admin_notes!: string | null;

  @Column({ name: "sort_order", default: 0 })
  sort_order!: number;

  @Column({ name: "submitted_at", type: "timestamp", nullable: true })
  submitted_at!: Date | null;

  @Column({ name: "moderated_at", type: "timestamp", nullable: true })
  moderated_at!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updated_at!: Date;
}
