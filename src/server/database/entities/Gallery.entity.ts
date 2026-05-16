import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GalleryImage } from "./GalleryImage.entity";

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

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text", nullable: true })
  price!: string | null;

  @Column({ name: "guest_pricing_enabled", default: false })
  guest_pricing_enabled!: boolean;

  @Column({ name: "require_guest_count", default: false })
  require_guest_count!: boolean;

  @Column({ name: "base_guest_capacity", type: "int", nullable: true })
  base_guest_capacity!: number | null;

  @Column({
    name: "extra_guest_cost",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  extra_guest_cost!: string | null;

  @Column({ name: "availability_status", default: "Available" })
  availability_status!: string;

  @Column({ name: "is_popular", default: false })
  is_popular!: boolean;

  @Column({ name: "is_trending", default: false })
  is_trending!: boolean;

  /** JSON array of inclusion strings */
  @Column({ type: "text", nullable: true })
  inclusions!: string | null;

  @Column({ name: "sort_order", default: 0 })
  sort_order!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at!: Date;

  @OneToMany(() => GalleryImage, (image) => image.gallery, { cascade: true })
  images!: GalleryImage[];
}
