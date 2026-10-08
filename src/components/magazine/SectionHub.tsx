"use client";
import { useMagazineLanguage } from "./MagazineLanguage";

import { useEffect, useRef } from "react";
import type { MagazineIssue, MagazineSection } from "@/data/nirvana-sutra/types";
import { MagazineIdentity } from "./MagazineIdentity";
import { CollectionField } from "./CollectionField";
import { useReadingMotion } from "./useReadingMotion";

type Props = {
  section: MagazineSection;
  issue: MagazineIssue;
  onBack: () => void;
  onOpenEntry: (entryId: string) => void;
};

const ROMAN_NUMS = ["", "I", "II", "III", "IV", "V"];

export function SectionHub({ section, issue, onBack, onOpenEntry }: Props) {
  const { t } = useMagazineLanguage();
  const headRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useReadingMotion(rootRef);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    headRef.current?.focus({ preventScroll: true });
  }, [section.id]);

  const sorted = [...section.entries].sort((a, b) => a.order - b.order);

  return (
    <div ref={rootRef} className="ns-hub">
      {/* Sticky bar */}
      <div className="ns-hub__bar">
        <button type="button" className="ns-back" onClick={onBack}>
          <span aria-hidden="true">←</span> {t(" यात्रा मानचित्र ")}</button>
        <MagazineIdentity issue={issue} />
      </div>

      <div className="ns-hub__col">
        {/* Header */}
        <header className="ns-hub__head">
          <MagazineIdentity issue={issue} className="ns-mobile-identity" />
          <p className="ns-hub__eyebrow">{t("पड़ाव ")}{section.mapOrder} · {section.entries.length} {t(" लेख")}</p>
          <h1 ref={headRef} tabIndex={-1} className="ns-hub__title">
            {section.title}
          </h1>
          <p className="ns-hub__desc" data-reveal>{section.description}</p>
          <CollectionField depth={section.id === "gehrai-sarovar"} />
          <hr className="ns-hub__rule" />
        </header>

        {/* Entry list */}
        <ol className="ns-hub__list" aria-label={("" + String(section.title) + t(" के लेख"))}>
          {sorted.map((entry, idx) => (
            <li key={entry.id} className="ns-hub__item" data-reveal style={{ ["--idx" as string]: idx }}>
              <button
                type="button"
                className="ns-hub__card"
                onClick={() => onOpenEntry(entry.id)}
                aria-label={`${entry.title} — ${entry.duration}`}
              >
                <span className="ns-hub__card-num" aria-hidden="true">
                  {ROMAN_NUMS[idx + 1] || idx + 1}
                </span>
                <span className="ns-hub__card-body">
                  <span className="ns-hub__card-eyebrow">{entry.eyebrow}</span>
                  <span className="ns-hub__card-title">{entry.title}</span>
                  <span className="ns-hub__card-meta">{entry.duration}</span>
                </span>
                <span className="ns-hub__card-arrow" aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
