"use client";
import { useMagazineLanguage } from "./MagazineLanguage";
import type { MagazineEntry, MagazineIssue, MagazineSection } from "@/data/nirvana-sutra/types";
import { MagazineIdentity } from "./MagazineIdentity";

export function ReaderBar({ issue, section, onBack, onBackToHub }: {
  issue: MagazineIssue;
  section?: MagazineSection;
  onBack: () => void;
  onBackToHub?: () => void;
}) {
  const { t } = useMagazineLanguage();
  return (
    <nav className="ns-reader__bar" aria-label={t("पत्रिका नेविगेशन")}>
      <div className="ns-reader__bar-nav">
        <button type="button" className="ns-back" onClick={onBack}>{t("← यात्रा मानचित्र")}</button>
        {section?.mode === "hub" && onBackToHub && <>
          <span className="ns-back-sep" aria-hidden="true">/</span>
          <button type="button" className="ns-back-hub" onClick={onBackToHub}>{section.title}</button>
        </>}
      </div>
      <MagazineIdentity issue={issue} />
    </nav>
  );
}

export function ReaderPager({ prev, next, onNavigate }: {
  prev: MagazineEntry | null;
  next: MagazineEntry | null;
  onNavigate: (id: string) => void;
}) {
  const { t } = useMagazineLanguage();
  return (
    <nav className="ns-pager" aria-label={t("लेख नेविगेशन")}>
      {prev ? <button type="button" className="ns-pager__btn ns-pager__btn--prev" onClick={() => onNavigate(prev.id)}>
        <span className="ns-pager__label">{t("← पिछली रचना")}</span>
        <span className="ns-pager__target">{prev.title}</span>
      </button> : <span />}
      {next ? <button type="button" className="ns-pager__btn ns-pager__btn--next" onClick={() => onNavigate(next.id)}>
        <span className="ns-pager__label">{t("अगली रचना →")}</span>
        <span className="ns-pager__target">{next.title}</span>
      </button> : <span />}
    </nav>
  );
}
