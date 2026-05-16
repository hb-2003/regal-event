"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/** Local `/uploads/*` files use native img so new uploads show immediately. */
export default function SettingsImagePreview({ src, alt, className }: Props) {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return null;

  if (trimmed.startsWith("/uploads/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={trimmed} alt={alt} className={className ?? "absolute inset-0 h-full w-full object-cover"} />
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
