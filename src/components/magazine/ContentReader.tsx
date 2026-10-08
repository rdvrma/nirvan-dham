"use client";
import { useMagazineLanguage } from "./MagazineLanguage";

import { useEffect, useRef } from "react";
import type { MagazineEntry, MagazineIssue } from "@/data/nirvana-sutra/types";
import { flatEntries, findSection } from "@/data/nirvana-sutra/types";
import { ArticleBody, articleHeadings } from "./ArticleBody";
import { ArticleListeningButton } from "./ListeningRoom";
import { ScrollamaArticle } from "./ScrollamaArticle";
import { ReaderBar, ReaderPager } from "./ReaderNavigation";
import { useReadingMotion } from "./useReadingMotion";
import { MagazineIdentity } from "./MagazineIdentity";

type Props = {
  entry: MagazineEntry;
  issue: MagazineIssue;
  onBack: () => void;
  onBackToHub: () => void;
  onNavigate: (id: string) => void;
};

export function ContentReader(props: Props) {
  const allEntries = flatEntries(props.issue);
  const index = allEntries.findIndex((entry) => entry.id === props.entry.id);
  const prev = index > 0 ? allEntries[index - 1] : null;
  const next = index < allEntries.length - 1 ? allEntries[index + 1] : null;
  return props.entry.id === "sadhak-se-satya-tak"
    ? <ScrollamaArticle {...props} prev={prev} next={next} />
    : <LampReader {...props} prev={prev} next={next} />;
}

function LampReader({ entry, issue, onBack, onBackToHub, onNavigate, prev, next }: Props & {
  prev: MagazineEntry | null; next: MagazineEntry | null;
}) {
  const { t, number } = useMagazineLanguage();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  useReadingMotion(rootRef, progressRef);
  const section = findSection(issue, entry.sectionId);
  const headings = articleHeadings(entry.body);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, [entry.id]);

  return (
    <article ref={rootRef} className={`ns-reader ns-reader--${entry.type}`}>
      <ReaderBar issue={issue} section={section} onBack={onBack} onBackToHub={onBackToHub} />
      <div className="ns-reading-progress" aria-hidden="true"><div ref={progressRef} /></div>
      <div className="ns-reader__col">
        <header className="ns-reader__head">
          <MagazineIdentity issue={issue} className="ns-mobile-identity" />
          <p className="ns-reader__section"><span className="ns-reader__order" aria-hidden="true">{number(section?.mapOrder ?? 1)}</span>{section?.title}</p>
          <p className="ns-reader__eyebrow">{entry.eyebrow}</p>
          <h1 ref={headingRef} tabIndex={-1} className="ns-reader__title">{entry.title}</h1>
          <p className="ns-reader__meta">{entry.duration}</p>
        </header>
        {entry.image && <figure className="ns-reader__figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.image} alt="" loading="lazy" />
        </figure>}
        <ArticleListeningButton entryId={entry.id} />
        {/* Native disclosure can be opened before React hydrates; keep that user action. */}
        {headings.length > 0 && <details className="ns-reader-toc" suppressHydrationWarning>
          <summary>{t("इस लेख में ")}<span>{headings.length} {t(" खंड")}</span></summary>
          <nav aria-label={t("लेख के खंड")}><ol>{headings.map(({ text, id }) => <li key={id}><a href={`#${id}`}>{text}</a></li>)}</ol></nav>
        </details>}
        <ArticleBody entry={entry} />
      </div>
      <ReaderPager prev={prev} next={next} onNavigate={onNavigate} />
      {entry.type === "silence" && <nav className="ns-reader__end" aria-label={t("यात्रा का विराम")}>
        <button type="button" className="ns-return" onClick={onBack}>{t("यात्रा मानचित्र पर लौटें")}</button>
      </nav>}
    </article>
  );
}
