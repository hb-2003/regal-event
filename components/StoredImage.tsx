"use client";

import { resolveDisplayImageSrc } from "@/lib/media-path";

type Props = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
};

/**
 * Stored uploads (/uploads, /api/media, blob URLs). Always uses <img> — never
 * next/image, so Vercel's optimizer does not request INVALID_IMAGE_OPTIMIZE_REQUEST.
 */
export default function StoredImage({
  src,
  alt,
  className,
  style,
  fill = false,
}: Props) {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return null;

  const displaySrc = resolveDisplayImageSrc(trimmed);
  const baseClass = className ?? (fill ? "absolute inset-0 h-full w-full object-cover" : undefined);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      className={baseClass}
      style={style ?? (fill ? { objectFit: "cover", width: "100%", height: "100%" } : undefined)}
      loading="lazy"
      decoding="async"
    />
  );
}
