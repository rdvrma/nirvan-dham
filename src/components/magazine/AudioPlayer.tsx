"use client";
import { useMagazineLanguage } from "./MagazineLanguage";

type Props = { src: string | null; title: string };

export function AudioPlayer({ src, title }: Props) {
  const { t } = useMagazineLanguage();
  if (!src) return null;
  return (
    <div className="ns-audio">
      <audio controls preload="none" src={src} aria-label={("" + String(title) + t(" — श्रवण"))} />
    </div>
  );
}
