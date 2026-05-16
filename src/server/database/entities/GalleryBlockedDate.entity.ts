import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("gallery_blocked_dates")
@Unique(["gallery_id", "blocked_date"])
export class GalleryBlockedDate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "gallery_id" })
  gallery_id!: number;

  @Column({ name: "blocked_date", type: "date" })
  blocked_date!: string;
}
