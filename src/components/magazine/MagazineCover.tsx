"use client";
import { useMagazineLanguage } from "./MagazineLanguage";

import type { MagazineIssue } from "@/data/nirvana-sutra/types";
import { useEffect, useRef } from "react";

type Props = {
  issue: MagazineIssue;
  leaving: boolean;
  onBegin: () => void;
};

/** Gold concentric ring radii */
const RINGS = [80, 130, 185, 250, 330];

/** Gold dust particles config — seeded so consistent on SSR → client */
const PARTICLES = [
  { left: "18%", top: "22%", delay: 0,    dur: 8  },
  { left: "72%", top: "35%", delay: 1.2,  dur: 11 },
  { left: "44%", top: "68%", delay: 2.8,  dur: 9  },
  { left: "85%", top: "15%", delay: 0.6,  dur: 13 },
  { left: "10%", top: "55%", delay: 3.4,  dur: 10 },
  { left: "60%", top: "80%", delay: 1.8,  dur: 8  },
  { left: "30%", top: "12%", delay: 4.2,  dur: 12 },
  { left: "92%", top: "62%", delay: 0.4,  dur: 9  },
  { left: "55%", top: "48%", delay: 2.1,  dur: 14 },
  { left: "24%", top: "88%", delay: 3.9,  dur: 10 },
  { left: "78%", top: "76%", delay: 1.5,  dur: 7  },
  { left: "6%",  top: "40%", delay: 5.1,  dur: 11 },
];

export function MagazineCover({ issue, leaving, onBegin }: Props) {
  const { t } = useMagazineLanguage();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);
  return (
    <section
      className="ns-cover"
      data-leaving={leaving ? "true" : "false"}
      aria-labelledby="ns-cover-title"
    >
      {/* Concentric gold rings */}
      <div className="ns-cover__rings" aria-hidden="true">
        <svg viewBox="-350 -350 700 700" fill="none">
          {RINGS.map((r, i) => (
            <circle
              key={r}
              cx="0"
              cy="0"
              r={r}
              stroke="rgba(201,162,79,0.18)"
              strokeWidth={i === 0 ? 1.5 : 1}
            />
          ))}
          {/* Small ornament at 12 o'clock */}
          <circle cx="0" cy={-RINGS[2]} r="3" fill="rgba(201,162,79,0.5)" />
          <circle cx={RINGS[2]} cy="0" r="2" fill="rgba(201,162,79,0.3)" />
          <circle cx="0" cy={RINGS[2]} r="2" fill="rgba(201,162,79,0.3)" />
        </svg>
      </div>

      {/* Gold dust particles */}
      <div className="ns-cover__particles" aria-hidden="true">
        {PARTICLES.slice(0, 5).map((p, i) => (
          <span
            key={i}
            className="ns-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom landscape silhouette */}
      <svg
        className="ns-cover__land"
        viewBox="0 0 1000 300"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <path
          className="ns-cover-hill-far"
          d="M0 160C120 110 220 140 340 110S560 70 680 108S880 80 1000 110V300H0Z"
        />
        <path
          className="ns-cover-hill-mid"
          d="M0 210C150 168 300 202 470 178S780 202 1000 164V300H0Z"
        />
        <path
          className="ns-cover-trail"
          pathLength={1}
          d="M-20 252C140 222 250 252 400 226S640 204 780 228S920 216 1020 196"
        />
      </svg>

      {/* Inner title block */}
      <div className="ns-cover__inner">
        <p className="ns-cover__eyebrow">{issue.publisher}</p>

        <h1 id="ns-cover-title" ref={headingRef} tabIndex={-1} className="ns-cover__title">
          <span className="ns-cover__name">{issue.title}</span>
          <span className="ns-cover__sub">{issue.subtitle}</span>
        </h1>

        <div className="ns-cover__divider">
          <span>{issue.issueLabel}</span>
        </div>

        <p className="ns-cover__tagline">{issue.tagline}</p>

        <button type="button" className="ns-cta" onClick={onBegin} disabled={leaving}>
          {t(" यात्रा आरम्भ करें ")}</button>

        <p className="ns-cover__publisher">nirvandham.in</p>
      </div>
    </section>
  );
}
