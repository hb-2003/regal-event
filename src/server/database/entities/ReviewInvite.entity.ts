import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("review_invites")
export class ReviewInvite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "booking_id", unique: true })
  booking_id!: string;

  @Column({ unique: true })
  token!: string;

  @Column({ name: "expires_at", type: "timestamp" })
  expires_at!: Date;

  @Column({ name: "sent_at", type: "timestamp" })
  sent_at!: Date;

  @Column({ name: "used_at", type: "timestamp", nullable: true })
  used_at!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at!: Date;
}
