"use client";
import { useMagazineLanguage } from "./MagazineLanguage";
import type { MagazineSection } from "@/data/nirvana-sutra/types";

const FEATURED: Record<string, string> = {
  "jo-badalta-rahta-hai": "बदलता रूप, जानता कौन?",
  "man-ko-shaant-karna": "मन: शांति या समझ?",
  "adhyatmik-anubhav-bhi-bit-jata-hai": "अनुभव भी बीत जाता है",
  "aatmabodh-ke-baad": "आत्मबोध और जीवन",
};

export function IssueArticles({ sections, onOpen, layout }: { sections: MagazineSection[]; onOpen: (id: string) => void; layout: string }) {
  const { t, language } = useMagazineLanguage();
  return <nav className="ns-map-articles" aria-labelledby={`ns-featured-${layout}`}>
    <h2 id={`ns-featured-${layout}`}>{t("इस अंक के चार विचार-पड़ाव")}</h2>
    <ol>{sections.flatMap(section => section.entries).filter(entry => FEATURED[entry.id]).map((entry, i) => <li key={entry.id}>
      <a href={`?story=${entry.id}&lang=${language}`} aria-label={entry.title} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onOpen(entry.id);
      }}>
        <small>{i < 2 ? t("ज्ञान पथ") : t("गहराई सरोवर")} · {entry.duration}</small>
        <strong>{t(FEATURED[entry.id])}</strong><span aria-hidden="true">{t("पढ़ें ↗")}</span>
      </a>
    </li>)}</ol>
  </nav>;
}
