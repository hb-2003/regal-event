import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "booking_id", unique: true })
  booking_id!: string;

  @Column({ name: "full_name" })
  full_name!: string;

  @Column()
  phone!: string;

  @Column()
  email!: string;

  @Column({ name: "event_date" })
  event_date!: string;

  @Column()
  category!: string;

  @Column({ type: "text", nullable: true })
  venue!: string | null;

  @Column({ type: "int", nullable: true })
  guests!: number | null;

  @Column({ type: "text", nullable: true })
  budget!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ default: "Pending" })
  status!: string;

  @Column({ name: "admin_notes", type: "text", nullable: true })
  admin_notes!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updated_at!: Date;
}
