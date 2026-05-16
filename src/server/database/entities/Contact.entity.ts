import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("contacts")
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "full_name" })
  full_name!: string;

  @Column()
  email!: string;

  @Column({ type: "text", nullable: true })
  phone!: string | null;

  @Column({ type: "text" })
  message!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at!: Date;
}
