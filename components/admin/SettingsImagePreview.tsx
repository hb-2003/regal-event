"use client";

import StoredImage from "@/components/StoredImage";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export default function SettingsImagePreview({ src, alt, className }: Props) {
  return <StoredImage src={src} alt={alt} className={className} fill />;
}
