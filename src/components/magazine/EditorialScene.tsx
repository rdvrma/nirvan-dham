"use client";
import { useMagazineLanguage } from "./MagazineLanguage";
import type { CSSProperties } from "react";
import type { EditorialScene as Scene } from "@/data/nirvana-sutra/types";

const indexStyle = (i: number) => ({ "--i": i } as CSSProperties);

function Center({ label = "" }: { label?: string }) {
  return <div className="ns-concept-center"><span className="ns-concept-center__ring" /><i />{label && <small>{label}</small>}</div>;
}

function Orbit({ scene }: { scene: Scene }) {
  return <div className={`ns-concept-orbit ns-concept-orbit--${scene.variant}`}>
    <div className="ns-concept-orbit__rings"><i /><i /><i /></div>
    <Center />
    {scene.items.map((text, i) => <div key={text} className="ns-concept-orbit__thought" style={indexStyle(i)}><span>{text}</span></div>)}
  </div>;
}

function Wave({ scene }: { scene: Scene }) {
  return <div className="ns-concept-wave">
    <svg viewBox="0 0 900 240" preserveAspectRatio="none" focusable="false">
      {Array.from({ length: 13 }, (_, i) => <path key={i} style={indexStyle(i)} className={i === 6 ? "ns-concept-wave__return" : "ns-concept-wave__stream"} d={`M -120 ${25 + i * 16} C 100 ${-85 + i * 33}, 210 ${265 - i * 8}, 390 ${60 + i * 11} S 710 ${210 - i * 8}, 1020 ${40 + i * 13}`} pathLength="100" />)}
    </svg>
    <div className="ns-concept-crossfade"><span className="ns-concept-first">{scene.items[0]}</span><span className="ns-concept-last">{scene.items[1]}</span></div>
  </div>;
}

function Belief({ scene }: { scene: Scene }) {
  const { t } = useMagazineLanguage();
  return <div className="ns-concept-belief">
    <svg className="ns-concept-belief__connections" viewBox="0 0 800 300" preserveAspectRatio="none" focusable="false">
      <path d="M400 150 L150 45 M400 150 L650 45 M400 150 L150 255 M400 150 L650 255" pathLength="100" />
      <circle cx="400" cy="150" r="70" />
    </svg>
    <div className="ns-concept-belief__phrase"><small className="ns-concept-belief__light">{t("विचार")}</small><small className="ns-concept-belief__held">{t("विश्वास")}</small><strong>{scene.items[0]}</strong></div>
    {scene.secondary?.map((text, i) => <span key={text} className="ns-concept-belief__satellite" style={indexStyle(i)}>{text}</span>)}
  </div>;
}

function Observer({ scene }: { scene: Scene }) {
  return <div className="ns-concept-observer">
    {scene.items.map((text, i) => <div className={`ns-concept-observer__side ns-concept-observer__side--${i}`} key={text}>
      <small>{text}</small>
      <svg viewBox="0 0 300 200" focusable="false"><path className="ns-concept-observer__moving" d="M35 110 Q80 15 125 100 T215 100 T270 95" />
        {i === 0 && Array.from({ length: 7 }, (_, n) => <path key={n} style={indexStyle(n)} className="ns-concept-observer__tangle" d={`M${20 + n * 18} 175 Q${240 - n * 14} ${n * 12}, ${60 + n * 27} 30 T${270 - n * 8} 155`} />)}
        <circle cx="150" cy="100" r="70" />
      </svg>
    </div>)}
    <div className="ns-concept-observer__open"><Center /><svg viewBox="0 0 400 200" focusable="false"><path d="M20 110 Q100 30 170 100 T320 100 T390 95" /></svg></div>
  </div>;
}

function Pause({ scene }: { scene: Scene }) {
  return <div className="ns-concept-pause">
    <div className="ns-concept-orbit__rings"><i /><i /></div>
    {scene.items.slice(1).map((text, i) => <span key={text} className="ns-concept-pause__thought" style={indexStyle(i)}>{text}</span>)}
    <strong className="ns-concept-first">{scene.items[0]}</strong><strong className="ns-concept-last">{scene.caption}</strong>
  </div>;
}

function Layers({ scene }: { scene: Scene }) {
  return <div className="ns-concept-layers"><div className="ns-concept-layers__field">
    {scene.items.map((text, i) => <div className="ns-concept-layers__layer" key={text} style={indexStyle(i)}><span>{text}</span></div>)}
    <Center />
  </div><ol>{scene.items.map(text => <li key={text}>{text}</li>)}</ol></div>;
}

function Sequence({ scene }: { scene: Scene }) {
  const daily = scene.variant === "daily", time = scene.variant === "time";
  return <div className={`ns-concept-sequence ns-concept-sequence--${scene.variant}`}>
    {!daily && !time && <Center />}
    <div className="ns-concept-sequence__axis" />
    {scene.items.map((text, i) => <div key={text} className="ns-concept-sequence__item" data-scene-item={daily || time ? undefined : i} style={indexStyle(i)}>
      <i className="ns-concept-sequence__form" /><span>{text}</span>
    </div>)}
  </div>;
}

function Cycle({ scene }: { scene: Scene }) {
  return <div className="ns-concept-cycle"><svg viewBox="0 0 400 360" focusable="false"><path d="M200 40 C370 40 405 280 255 316 C100 365 -20 205 75 90 C105 55 155 40 200 40" pathLength="100" /></svg>
    <Center />{scene.items.map((text, i) => <span key={text} style={indexStyle(i)}>{text}</span>)}
  </div>;
}

function Transform({ scene }: { scene: Scene }) {
  const { t } = useMagazineLanguage();
  if (scene.variant === "belief") return <Belief scene={scene} />;
  if (scene.variant === "event") return <div className="ns-concept-event">{scene.items.map((text, i) => <div key={text} className="ns-concept-event__row"><div><small>{t("घटना")}</small><strong>{text}</strong></div><span className="ns-concept-event__link">→</span><div className="ns-concept-event__identity"><small>{t("जोड़ी हुई पहचान")}</small><strong>{scene.secondary?.[i]}</strong></div></div>)}</div>;
  return <div className="ns-concept-life"><div className="ns-concept-life__ideal">{scene.items.map((text, i) => <span key={text} style={indexStyle(i)}>{text}</span>)}</div><div className="ns-concept-life__actual">{scene.secondary?.map((text, i) => <span key={text} style={indexStyle(i)}>{text}</span>)}</div><Center /></div>;
}

function Mirror({ scene }: { scene: Scene }) {
  return <div className="ns-concept-mirror"><div className="ns-concept-mirror__frame" /><div className="ns-concept-mirror__passing" /><div className="ns-concept-mirror__reflection" /><div className="ns-concept-mirror__labels">{scene.items.map(text => <span key={text}>{text}</span>)}</div></div>;
}

function Journey({ scene }: { scene: Scene }) {
  return <div className="ns-concept-journey">
    <svg viewBox="0 0 800 250" preserveAspectRatio="none" focusable="false"><path d="M40 190C160 190 110 65 220 65S300 200 400 140S520 35 580 90S680 180 760 60" pathLength="100" /></svg>
    {scene.items.map((text, i) => <div key={text} style={indexStyle(i)}><i /><span>{text}</span></div>)}
  </div>;
}

function Lyric({ scene }: { scene: Scene }) {
  return <div className="ns-concept-lyric"><Center />
    <svg viewBox="0 0 800 300" preserveAspectRatio="none" focusable="false">
      {[0, 1, 2, 3, 4].map(i => <path key={i} style={indexStyle(i)} d={`M-50 ${120 + i * 14} Q120 ${-90 + i * 35} 280 ${150 + i * 8} T850 ${120 + i * 14}`} pathLength="100" />)}
    </svg>
    <div>{scene.items.map((text, i) => <span key={text} style={indexStyle(i)}>{text}</span>)}</div>
  </div>;
}

function Release({ scene }: { scene: Scene }) {
  return <div className="ns-concept-release">
    <div className="ns-concept-release__clock"><svg viewBox="0 0 300 300" focusable="false"><circle cx="150" cy="150" r="105" pathLength="100" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M150 55V65" transform={`rotate(${i * 30} 150 150)`} />)}
      <g className="ns-concept-release__hands"><path d="M150 150V82 M150 150L198 150" /></g><circle cx="150" cy="150" r="4" />
    </svg></div>
    <svg className="ns-concept-release__smile" viewBox="0 0 300 300" focusable="false"><circle cx="112" cy="115" r="3"/><circle cx="188" cy="115" r="3"/><path d="M95 160Q150 225 205 160" pathLength="100" /></svg>
    <div>{scene.items.map((text, i) => <span key={text} style={indexStyle(i)}>{text}</span>)}</div>
  </div>;
}

function Stillness({ scene }: { scene: Scene }) {
  return <div className="ns-concept-stillness">
    {[0, 1, 2, 3, 4].map(i => <i key={i} style={indexStyle(i)} />)}<Center />
    <div>{scene.items.map((text, i) => <span key={text} style={indexStyle(i)}>{text}</span>)}</div>
  </div>;
}

const illustrations = {
  "thought-flow": Orbit, wave: Wave, transform: Transform, "dual-state": Observer,
  "quote-pause": Pause, "identity-layers": Layers, sequence: Sequence, cycle: Cycle, mirror: Mirror,
  journey: Journey, lyric: Lyric, release: Release, stillness: Stillness,
};

/** Stable markup; the reader's one shared motion controller updates CSS properties. */
export function EditorialScene({ scene, order }: { scene: Scene; order: number }) {
  const { t, number } = useMagazineLanguage();
  const Illustration = illustrations[scene.type];
  const id = `ns-editorial-${scene.id}`;
  return <figure id={id} className={`ns-editorial-scene ns-editorial-scene--${scene.type}`} data-editorial-scene data-scene-kind={scene.type} data-scene-variant={scene.variant} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <header className="ns-editorial-scene__head"><span>{t("दृश्य मनन · ")}{number(order)}</span><h3 id={`${id}-title`}>{scene.title}</h3></header>
    <div className="ns-editorial-scene__visual" aria-hidden="true"><Illustration scene={scene} /></div>
    <figcaption><strong className={scene.type === "quote-pause" ? "ns-sr-only" : undefined}>{scene.caption}</strong><span id={`${id}-description`}>{scene.description}</span><span className="ns-sr-only">{[...scene.items, ...(scene.secondary ?? [])].join(" · ")}</span></figcaption>
  </figure>;
}
