import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Gallery } from "./Gallery.entity";

@Entity("gallery_blocked_dates")
@Unique(["gallery_id", "blocked_date"])
export class GalleryBlockedDate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "gallery_id" })
  gallery_id!: number;

  @ManyToOne(() => Gallery, { onDelete: "CASCADE" })
  @JoinColumn({ name: "gallery_id" })
  gallery!: Gallery;

  @Column({ name: "blocked_date", type: "date" })
  blocked_date!: string;
}
