"use client";

import Image from "next/image";
import { isLocalUploadPath, isRemoteImagePath } from "@/lib/media-path";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/** Local `/uploads/*` or remote HTTPS (Vercel Blob, etc.). */
export default function SettingsImagePreview({ src, alt, className }: Props) {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return null;

  if (isLocalUploadPath(trimmed) || isRemoteImagePath(trimmed)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={trimmed}
        alt={alt}
        className={className ?? "absolute inset-0 h-full w-full object-cover"}
      />
    );
  }

  return (
    <Image
      src={trimmed}
      alt={alt}
      fill
      className={className}
      style={{ objectFit: "cover" }}
      unoptimized
    />
  );
}
