"use client";
import { useMagazineLanguage } from "./MagazineLanguage";
import { memo, useEffect, useRef } from "react";
import { findSection, type MagazineEntry, type MagazineIssue } from "@/data/nirvana-sutra/types";
import { flagshipScenes } from "@/data/nirvana-sutra/scenes";
import { ArticleBody } from "./ArticleBody";
import { ReaderBar, ReaderPager } from "./ReaderNavigation";
import { useFlagshipMotion } from "./useFlagshipMotion";
import { MagazineIdentity } from "./MagazineIdentity";
import { ArticleListeningButton } from "./ListeningRoom";

const TITLES = ["खोज बाहर की ओर", "जो जाना जा रहा है", "साधक कौन है?", "खोज लौटती है", "लहर और समुद्र"];
const LABELS = ["खोज", "अनुभव", "साधक", "भीतर", "समुद्र"];
const OBJECTS = ["शरीर", "विचार", "सुख", "दुःख", "शांति", "अशांति"];
const POINTS = [[300, 70], [450, 150], [450, 310], [300, 390], [150, 310], [150, 150]];

/** Stable DOM; scroll writes visual attributes, never article text. */
const InquiryStage = memo(function InquiryStage() {
  const { t } = useMagazineLanguage();
  return <aside className="ns-story-stage" aria-label={t("खोज से समुद्र तक बदलता प्रतीकात्मक दृश्य")} data-visual-stage data-visual-scene="1">
    <div className="ns-story-stage__field">
      <svg viewBox="0 0 600 460" fill="none" className="ns-story-svg" aria-hidden="true">
        <defs>
          <radialGradient id="ns-seeker-light"><stop stopColor="#f0d394" stopOpacity=".3"/><stop offset="1" stopColor="#c9a24f" stopOpacity="0"/></radialGradient>
          <linearGradient id="ns-ocean-depth" x2="0" y2="1"><stop stopColor="#254b40" stopOpacity=".65"/><stop offset="1" stopColor="#0e1612"/></linearGradient>
        </defs>
        <g className="ns-stage-layer ns-stage-search">
          <path d="M35 305Q160 250 280 277T565 220" stroke="#8f9b78" strokeOpacity=".25"/>
          <path d="M35 355Q210 300 340 345T565 300" stroke="#8f9b78" strokeOpacity=".12"/>
          <circle cx="490" cy="160" r="70" fill="url(#ns-seeker-light)" data-visual="target-glow"/>
          <path d="M92 305C175 300 150 180 270 220S385 210 490 160" pathLength="1" className="ns-search-path" data-visual="outward-path"/>
          <circle cx="490" cy="160" r="9" className="ns-stage-dot"/>
          <g data-visual="outward-seeker" transform="translate(92 305)"><circle r="5" fill="#f7efe2"/><circle r="17" stroke="#c9a24f" strokeOpacity=".35"/></g>
        </g>
        <g className="ns-stage-layer ns-stage-objects">
          <circle cx="300" cy="230" r="100" className="ns-stage-orbit"/><circle cx="300" cy="230" r="160" className="ns-stage-orbit"/>
          {OBJECTS.map((text, i) => <g key={text} data-experience={i} className="ns-experience">
            <circle cx={POINTS[i][0]} cy={POINTS[i][1]} r="6"/>
            <text x={POINTS[i][0]} y={POINTS[i][1] + 29} textAnchor="middle">{t(text)}</text>
          </g>)}
          <circle cx="300" cy="230" r="5" className="ns-stage-dot"/>
        </g>
        <g className="ns-stage-layer ns-stage-question">
          <circle cx="300" cy="230" r="112" stroke="#c9a24f" strokeWidth="1.3"/>
          <circle cx="300" cy="230" r="126" stroke="#c9a24f" strokeOpacity=".12"/>
          <text x="300" y="240" textAnchor="middle">{t("साधक कौन है?")}</text>
        </g>
        <g className="ns-stage-layer ns-stage-inward">
          <path d="M490 160Q390 280 300 220T110 290" pathLength="1" className="ns-search-path" data-visual="inward-path"/>
          <circle cx="300" cy="220" r="62" className="ns-stage-orbit" data-visual="ring-left"/>
          <circle cx="300" cy="220" r="62" className="ns-stage-orbit" data-visual="ring-right"/>
          <circle cx="110" cy="290" r="5" fill="#f7efe2" data-visual="inward-seeker"/>
          <circle cx="490" cy="160" r="14" className="ns-stage-dot" data-visual="inward-target"/>
          <circle cx="300" cy="220" r="4" className="ns-stage-dot"/>
        </g>
        <g className="ns-stage-layer ns-stage-ocean">
          <path d="M0 260H600V460H0Z" fill="url(#ns-ocean-depth)"/>
          <path d="M0 260H600" stroke="#c9a24f" strokeOpacity=".5"/>
          {[0, 1, 2].map(i => <path key={i} data-sea-line={i} stroke="#8f9b78" strokeOpacity={.35 - i * .07} strokeWidth="1"/>)}
          <path d="M130 290C180 290 190 210 245 215S290 320 355 290 400 260 450 285" className="ns-individual-wave" data-visual="wave"/>
        </g>
      </svg>
      <p className="ns-stage-caption"><span data-caption>{t("मैं यहाँ हूँ। सत्य कहीं वहाँ।")}</span></p>
      <div className="ns-ocean-quotes" aria-hidden="true">
        <p data-visual="ocean-quote-a">{t("लहर को समुद्र बनने की आवश्यकता नहीं होती।")}</p>
        <p data-visual="ocean-quote-b">{t("वह कभी समुद्र से अलग थी ही नहीं।")}</p>
      </div>
    </div>
    <div className="ns-stage-index" aria-hidden="true">{LABELS.map((label, i) => <span key={label} data-stage-index={i + 1}>{t(label)}</span>)}</div>
  </aside>;
});

export function ScrollamaArticle({ entry, issue, onBack, onBackToHub, prev, next, onNavigate }: {
  entry: MagazineEntry; issue: MagazineIssue; onBack: () => void; onBackToHub?: () => void;
  prev: MagazineEntry | null; next: MagazineEntry | null; onNavigate: (id: string) => void;
}) {
  const { t } = useMagazineLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const activeScene = useFlagshipMotion(rootRef, progressRef);
  const scenes = flagshipScenes(entry.body);
  const section = findSection(issue, entry.sectionId);
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, [entry.id]);
  return <article ref={rootRef} className="ns-scrolly ns-flagship" data-active-scene={activeScene}>
    <ReaderBar issue={issue} section={section} onBack={onBack} onBackToHub={onBackToHub}/>
    <div className="ns-reading-progress" aria-hidden="true"><div ref={progressRef}/></div>
    <header className="ns-story-head">
      <MagazineIdentity issue={issue} className="ns-mobile-identity" />
      <p>{entry.eyebrow} · {entry.duration}</p>
      <h1 ref={headingRef} tabIndex={-1}>{entry.title}</h1>
      <span>{t("पढ़ते हुए आगे बढ़ें — दृश्य आपकी खोज के साथ बदलेंगे।")}</span>
      <ArticleListeningButton entryId={entry.id} />
    </header>
    {scenes.length === 5 ? <div className="ns-story-layout">
      <InquiryStage/>
      <div className="ns-story-steps">
        {scenes.map((blocks, i) => <section key={i} id={`ns-scene-${i + 1}`} data-story-step={i + 1} className="ns-story-step" aria-labelledby={`ns-story-heading-${i + 1}`}>
          <p className="ns-story-step__number">{[t("०१"), t("०२"), t("०३"), t("०४"), t("०५")][i]} {t(" / ०५")}</p>
          <h2 id={`ns-story-heading-${i + 1}`}>{t(TITLES[i])}</h2>
          <div className="ns-scrolly-prose">{blocks.map((block, j) => j === 0 && block === t(TITLES[i]) ? null : <p key={j}>{block}</p>)}</div>
          {i < 4 && <a className="ns-story-next" href={`#ns-scene-${i + 2}`}>{t(TITLES[i + 1])} <span aria-hidden="true">↓</span></a>}
        </section>)}
      </div>
    </div> : <div className="ns-reader__col"><ArticleBody entry={entry}/></div>}
    <nav className="ns-story-navigation" aria-label={t("विशेष लेख के खंड")}>{LABELS.map((label, i) => <a key={label} href={`#ns-scene-${i + 1}`} aria-current={activeScene === i + 1 ? "step" : undefined}>{t(label)}</a>)}</nav>
    <ReaderPager prev={prev} next={next} onNavigate={onNavigate}/>
  </article>;
}
