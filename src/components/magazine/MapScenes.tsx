"use client";
import { useMagazineLanguage } from "./MagazineLanguage";
import type { ReactNode } from "react";

/**
 * Handcrafted symbolic landscapes for the journey map.
 * Dark premium night-landscape — CSS classes control fills.
 *
 * Wide: viewBox 1000 × 600
 * Tall: viewBox  400 × 1180
 */

function Tree({ x, y, s = 1, light = false }: { x: number; y: number; s?: number; light?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0V-10" className="ns-trunk" />
      <ellipse cx="0" cy="-21" rx="9" ry="14" className={light ? "ns-leaf ns-leaf--light" : "ns-leaf"} />
    </g>
  );
}

function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <g className="ns-reveal" style={{ ["--d" as string]: `${delay}s` }}>
      {children}
    </g>
  );
}

function Bloom({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="2.2" className="ns-bloom" />;
}

function Star({ x, y, r = 1.2 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} className="ns-star" />;
}

function NightSky({ id, width, height }: { id: string; width: number; height: number }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="ns-stop-sky-a" />
          <stop offset="0.5" className="ns-stop-sky-b" />
          <stop offset="1" className="ns-stop-sky-c" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="ns-stop-water-a" />
          <stop offset="1" className="ns-stop-water-b" />
        </linearGradient>
        <linearGradient id={`${id}-road-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(201,162,79,0.25)" />
          <stop offset="30%"  stopColor="rgba(201,162,79,0.7)" />
          <stop offset="70%"  stopColor="rgba(201,162,79,0.7)" />
          <stop offset="100%" stopColor="rgba(201,162,79,0.25)" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id}-sky)`} />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* WIDE (desktop)                                                       */
/* ──────────────────────────────────────────────────────────────────── */

export function WideScene({ pathD, highlightPath }: { pathD: string; highlightPath: string }) {
  const { t } = useMagazineLanguage();
  return (
    <svg
      className="ns-scene"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      role="img"
      aria-label={t("निर्वाण सूत्र यात्रा मानचित्र — रात्रि परिदृश्य")}
    >
      <NightSky id="w" width={1000} height={600} />

      {/* Stars + moon */}
      <Reveal delay={0.05}>
        {/* Moon */}
        <circle cx="760" cy="68" r="22" className="ns-moon" />
        <circle cx="760" cy="68" r="38" className="ns-moon-ring" />
        {/* Stars */}
        <Star x={640} y={52} r={1.4} />
        <Star x={680} y={34} />
        <Star x={704} y={56} r={0.9} />
        <Star x={820} y={38} r={1.1} />
        <Star x={848} y={58} r={0.8} />
        <Star x={550} y={42} r={1.2} />
        <Star x={580} y={26} r={0.8} />
        <Star x={420} y={30} r={1} />
        <Star x={460} y={52} r={0.9} />
        <Star x={200} y={44} r={1.3} />
        <Star x={140} y={28} r={0.9} />
        <Star x={900} y={44} r={1} />
        <Star x={940} y={22} r={0.8} />
        <Star x={50}  y={36} r={1.1} />
        <Star x={80}  y={60} r={0.7} />
      </Reveal>

      {/* Terrain */}
      <Reveal delay={0.04}>
        <path
          className="ns-hill-far"
          d="M0 200C80 160 165 180 255 162S425 115 525 148S695 122 795 140S935 112 1000 140V600H0Z"
        />
        <path
          className="ns-hill-mid"
          d="M0 298C110 248 218 268 330 242S545 208 645 246S862 210 1000 238V600H0Z"
        />
        <path
          className="ns-ground"
          d="M0 388C152 354 305 386 465 360S775 390 1000 348V600H0Z"
        />
        <path d="M0 148H1000" className="ns-horizon" />
      </Reveal>

      {/* Lake (nodes 5/6 area — gyan path / sarovar) */}
      <Reveal delay={0.38}>
        <ellipse cx="807" cy="256" rx="118" ry="54" fill="url(#w-water)" className="ns-lake" />
        <path d="M732 260q15-5 30 0t30 0t30 0M772 278q13-4 26 0t26 0M756 238q11-3 22 0t22 0" className="ns-ripple" />
        {/* Moon reflection */}
        <ellipse cx="807" cy="248" rx="18" ry="5" fill="rgba(255,240,200,0.08)" />
        <path d="M920 314l-3-12M928 316l1-14M936 314l4-11" className="ns-reed" />
      </Reveal>

      {/* Courtyard — node 1 (प्रवेश) */}
      <Reveal delay={0.28}>
        <path d="M50 448L120 420L190 448L120 478Z" className="ns-court" />
        <path d="M82 448L120 432L158 448L120 464Z" className="ns-court-inner" />
        <Tree x={42} y={414} s={0.9} />
        <Tree x={196} y={426} s={0.75} light />
        <Bloom x={50} y={422} />
      </Reveal>

      {/* Garden — node 2 (गीत) */}
      <Reveal delay={0.38}>
        <ellipse cx="272" cy="346" rx="78" ry="22" className="ns-lawn" />
        {[220, 240, 260, 280, 300, 320].map((x, i) => (
          <Bloom key={`wg1-${x}`} x={x} y={340 + (i % 2) * 3} />
        ))}
        {[232, 252, 272, 292, 312].map((x, i) => (
          <Bloom key={`wg2-${x}`} x={x} y={353 + (i % 2) * 3} />
        ))}
        <Tree x={194} y={334} s={0.8} light />
        <Tree x={352} y={326} s={0.7} />
      </Reveal>

      {/* Grove — node 3 (हास्य) */}
      <Reveal delay={0.48}>
        <circle cx="358" cy="416" r="14" className="ns-bush" />
        <circle cx="374" cy="422" r="10" className="ns-bush--light" />
        <circle cx="464" cy="426" r="14" className="ns-bush" />
        <circle cx="450" cy="434" r="9" className="ns-bush--light" />
        <circle cx="406" cy="448" r="11" className="ns-bush" />
        <Bloom x={356} y={410} />
        <Bloom x={466} y={420} />
        <Bloom x={406} y={443} />
      </Reveal>

      {/* Forest — node 4 (कहानी) */}
      <Reveal delay={0.56}>
        <Tree x={468} y={258} s={1.15} />
        <Tree x={492} y={228} s={0.85} light />
        <Tree x={584} y={250} s={1.2} />
        <Tree x={608} y={224} s={0.8} light />
        <Tree x={562} y={288} s={0.95} />
        <Tree x={502} y={290} s={0.8} />
        <Tree x={614} y={280} s={0.7} />
      </Reveal>

      {/* Stones — node 5 (ज्ञान पथ) */}
      <Reveal delay={0.66}>
        <ellipse cx="614" cy="380" rx="9" ry="4" className="ns-stone" />
        <ellipse cx="634" cy="392" rx="6" ry="3" className="ns-stone" />
        <ellipse cx="716" cy="394" rx="8" ry="3.5" className="ns-stone" />
        <Tree x={704} y={426} s={0.8} />
      </Reveal>

      {/* Far shore trees */}
      <Reveal delay={0.78}>
        <Tree x={958} y={466} s={0.9} light />
        <Tree x={978} y={438} s={0.7} />
        <Tree x={808} y={496} s={0.75} light />
        <Tree x={302} y={518} s={0.85} />
        <Tree x={152} y={538} s={0.7} light />
        <Tree x={42} y={288} s={0.8} light />
        <Tree x={152} y={224} s={0.7} />
      </Reveal>

      {/* Path glow + line */}
      <path d={pathD} className="ns-road-glow" pathLength={1} />
      <path d={pathD} className="ns-road" stroke="url(#w-road-grad)" pathLength={1} />
      <path d={pathD} className="ns-trail" />
      <path d={highlightPath} className="ns-road-highlight" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* TALL (mobile / small tablet)                                         */
/* ──────────────────────────────────────────────────────────────────── */

export function TallScene({ pathD, highlightPath }: { pathD: string; highlightPath: string }) {
  const { t } = useMagazineLanguage();
  return (
    <svg
      className="ns-scene"
      viewBox="0 0 400 1180"
      preserveAspectRatio="none"
      role="img"
      aria-label={t("निर्वाण सूत्र यात्रा मानचित्र")}
    >
      <NightSky id="t" width={400} height={1180} />

      {/* Moon + stars */}
      <Reveal delay={0.05}>
        <circle cx="316" cy="46" r="18" className="ns-moon" />
        <circle cx="316" cy="46" r="32" className="ns-moon-ring" />
        <Star x={200} y={30} r={1.2} />
        <Star x={230} y={50} r={0.9} />
        <Star x={160} y={42} r={1} />
        <Star x={80}  y={28} r={0.8} />
        <Star x={50}  y={52} r={1.1} />
        <Star x={380} y={30} r={0.9} />
      </Reveal>

      <Reveal delay={0.04}>
        <path className="ns-hill-far" d="M0 118C60 80 132 100 204 76S334 62 400 92V1180H0Z" />
        <path className="ns-hill-mid" d="M0 188C90 158 184 178 274 152S362 158 400 146V1180H0Z" />
        <path className="ns-ground"   d="M0 298C100 274 254 308 400 272V1180H0Z" />
        <path d="M0 98H400" className="ns-horizon" />
      </Reveal>

      {/* Courtyard node 1 */}
      <Reveal delay={0.28}>
        <path d="M34 100L86 80L138 100L86 122Z" className="ns-court" />
        <path d="M56 100L86 88L116 100L86 114Z" className="ns-court-inner" />
        <Tree x={326} y={92} s={0.8} />
        <Tree x={352} y={116} s={0.65} light />
      </Reveal>

      {/* Garden node 2 */}
      <Reveal delay={0.38}>
        <ellipse cx="290" cy="272" rx="68" ry="19" className="ns-lawn" />
        {[248, 266, 284, 302, 320, 338].map((x, i) => (
          <Bloom key={`tg1-${x}`} x={x} y={266 + (i % 2) * 3} />
        ))}
        <Tree x={44} y={248} s={0.8} light />
      </Reveal>

      {/* Grove node 3 */}
      <Reveal delay={0.48}>
        <circle cx="52" cy="418" r="14" className="ns-bush" />
        <circle cx="68" cy="426" r="10" className="ns-bush--light" />
        <circle cx="332" cy="410" r="13" className="ns-bush" />
        <circle cx="348" cy="418" r="9" className="ns-bush--light" />
        <Bloom x={50} y={412} />
        <Bloom x={334} y={404} />
      </Reveal>

      {/* Forest node 4 */}
      <Reveal delay={0.56}>
        <Tree x={44} y={518} s={1.25} />
        <Tree x={78} y={554} s={0.9} light />
        <Tree x={26} y={588} s={0.8} />
        <Tree x={358} y={476} s={0.9} light />
        <Tree x={372} y={618} s={1.1} />
        <Tree x={332} y={648} s={0.75} light />
      </Reveal>

      {/* Stones node 5 */}
      <Reveal delay={0.66}>
        <ellipse cx="192" cy="750" rx="10" ry="4" className="ns-stone" />
        <ellipse cx="216" cy="762" rx="6" ry="3" className="ns-stone" />
        <ellipse cx="62"  cy="674" rx="8" ry="3.5" className="ns-stone" />
        <Tree x={352} y={768} s={0.8} />
      </Reveal>

      {/* Lake + shore nodes 6 + 7 */}
      <Reveal delay={0.52}>
        <g transform="translate(0 -170)">
        <ellipse cx="254" cy="980" rx="122" ry="48" fill="url(#t-water)" className="ns-lake" />
        <path d="M172 984q13-5 26 0t26 0t26 0M216 1006q11-4 22 0t22 0M206 960q11-3 22 0t22 0" className="ns-ripple" />
        <ellipse cx="254" cy="974" rx="16" ry="4" fill="rgba(255,240,200,0.07)" />
        <path d="M72 1038l-3-12M80 1040l1-14M88 1038l4-11" className="ns-reed" />
        <Tree x={368} y={898} s={0.9} />
        <Tree x={44} y={898} s={0.8} light />
        <Tree x={338} y={1098} s={0.9} light />
        <Tree x={368} y={1128} s={0.7} />
        </g>
      </Reveal>

      <path d={pathD} className="ns-road-glow" pathLength={1} />
      <path d={pathD} className="ns-road" stroke="url(#t-road-grad)" pathLength={1} />
      <path d={pathD} className="ns-trail" />
      <path d={highlightPath} className="ns-road-highlight" />
    </svg>
  );
}
