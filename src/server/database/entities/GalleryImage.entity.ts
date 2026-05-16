import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Gallery } from "./Gallery.entity";

@Entity("gallery_images")
export class GalleryImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "gallery_id" })
  gallery_id!: number;

  @ManyToOne(
    () =>
      // Lazy require avoids Gallery ↔ GalleryImage circular init in bundled builds
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./Gallery.entity").Gallery as typeof import("./Gallery.entity").Gallery,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "gallery_id" })
  gallery!: Gallery;

  @Column({ name: "image_path" })
  image_path!: string;

  @Column({ name: "sort_order", default: 0 })
  sort_order!: number;
}
