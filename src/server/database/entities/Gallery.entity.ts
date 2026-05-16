import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("gallery")
export class Gallery {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text", nullable: true })
  title!: string | null;

  @Column({ type: "text", nullable: true })
  category!: string | null;

  @Column({ name: "image_path" })
  image_path!: string;

  @Column({ name: "sort_order", default: 0 })
  sort_order!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at!: Date;
}
