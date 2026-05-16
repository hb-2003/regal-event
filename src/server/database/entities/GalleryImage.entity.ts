import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("gallery_images")
export class GalleryImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "gallery_id" })
  gallery_id!: number;

  @Column({ name: "image_path" })
  image_path!: string;

  @Column({ name: "sort_order", default: 0 })
  sort_order!: number;
}
