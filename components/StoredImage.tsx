"use client";

import Image from "next/image";
import { resolveDisplayImageSrc, shouldUseNativeImg } from "@/lib/media-path";

type Props = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

/** Renders DB-stored paths: `/uploads/*`, `/api/media?…`, blob URLs, or remote HTTPS. */
export default function StoredImage({
  src,
  alt,
  className,
  style,
  sizes,
  fill = false,
  width,
  height,
  priority,
}: Props) {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return null;

  const displaySrc = resolveDisplayImageSrc(trimmed);
  const imgClass = className ?? (fill ? "absolute inset-0 h-full w-full object-cover" : undefined);

  if (shouldUseNativeImg(displaySrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={alt}
        className={imgClass}
        style={style ?? (fill ? { objectFit: "cover", width: "100%", height: "100%" } : undefined)}
        width={width}
        height={height}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className={className}
        style={{ objectFit: "cover", ...style }}
        sizes={sizes}
        priority={priority}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width ?? 500}
      height={height ?? 400}
      className={className}
      style={style}
      sizes={sizes}
      priority={priority}
      unoptimized
    />
  );
}
