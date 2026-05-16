import { deleteStoredImageIfExists } from "@/lib/media-storage";

export function unlinkUploadIfExists(imagePath: string): void {
  void deleteStoredImageIfExists(imagePath);
}
