// Abstract teaching graphics of Nirvan Sutra. They are metaphors for a distinction the teaching points to — never pictures of an attainment.
// Pure SVG + CSS motion (yatra.css), quiet under prefers-reduced-motion. Labels come from the learner's language.

// coordinates rounded so the server render and the browser agree to the digit (no hydration mismatch)
const r2 = (v: number) => Math.round(v * 100) / 100;
const GOLD = '#e9c875', LINE = 'rgba(212,168,67,0.35)', SOFT = 'rgba(243,234,212,0.55)', FAINT = 'rgba(243,234,212,0.18)';

export function Orb({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={{ overflow: 'visible' }}>
      <circle cx="60" cy="60" r="56" fill="none" stroke={LINE} strokeWidth="0.8" />
      <circle cx="60" cy="60" r="40" fill="none" stroke={FAINT} strokeWidth="0.8" className="ns-spin-slow" strokeDasharray="2 6" style={{ transformOrigin: '60px 60px', animation: 'ns-spin 80s linear infinite' }} />
      <circle cx="60" cy="60" r="22" fill="rgba(233,200,117,0.08)" style={{ transformOrigin: '60px 60px', animation: 'ns-breathe 6s ease-in-out infinite' }} />
      <circle cx="60" cy="60" r="4" fill={GOLD} />
    </svg>
  );
}

/** The quiet geometry behind a stage opening: concentric circles whose count grows with the stage. */
export function StageOrb({ n }: { n: number }) {
  const rings = Array.from({ length: 5 }, (_, i) => 60 + i * 44);
  return (
    <svg className="ns-opening-orb" viewBox="0 0 520 520" aria-hidden="true">
      {rings.map((r, i) => <circle key={r} cx="260" cy="260" r={r} fill="none" stroke={i === 0 ? 'rgba(212,168,67,0.3)' : 'rgba(212,168,67,0.08)'} strokeWidth="1" strokeDasharray={i % 2 ? '2 8' : undefined} />)}
      <g style={{ transformOrigin: '260px 260px', animation: 'ns-spin 160s linear infinite' }}>
        {Array.from({ length: n }, (_, i) => { const a = (i / 17) * Math.PI * 2 - Math.PI / 2; return <circle key={i} cx={r2(260 + Math.cos(a) * 192)} cy={r2(260 + Math.sin(a) * 192)} r={i === n - 1 ? 4 : 2.2} fill={i === n - 1 ? GOLD : 'rgba(233,200,117,0.45)'} />; })}
      </g>
    </svg>
  );
}

type G = Record<string, string>;
/** SEER / SEEN: a point of awareness, things moving around it. */
function SeerSeen({ g }: { g: G }) {
  const things = [g.gThought, g.gSensation, g.gEmotion, g.gObject];
  return (
    <svg className="ns-graphic" viewBox="0 0 400 400" role="img" aria-label={`${g.gAwareness} · ${things.join(', ')}`}>
      <circle cx="200" cy="200" r="150" fill="none" stroke={FAINT} />
      <circle cx="200" cy="200" r="96" fill="none" stroke={FAINT} strokeDasharray="2 6" />
      <g className="ns-orbit">{things.map((t, i) => { const a = (i / things.length) * Math.PI * 2; const x = r2(200 + Math.cos(a) * 150), y = r2(200 + Math.sin(a) * 150); return <g key={t}><circle cx={x} cy={y} r="7" fill={SOFT} /><text x={x} y={y - 16} fill={SOFT} fontSize="14" textAnchor="middle">{t}</text></g>; })}</g>
      <g className="ns-orbit-2">{[0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2 + 0.5; return <circle key={i} cx={r2(200 + Math.cos(a) * 96)} cy={r2(200 + Math.sin(a) * 96)} r="4" fill={FAINT} />; })}</g>
      <circle cx="200" cy="200" r="30" fill="rgba(233,200,117,0.1)" style={{ transformOrigin: '200px 200px', animation: 'ns-breathe 6s ease-in-out infinite' }} />
      <circle cx="200" cy="200" r="6" fill={GOLD} />
      <text x="200" y="236" fill={GOLD} fontSize="14" textAnchor="middle">{g.gAwareness}</text>
    </svg>
  );
}

/** NETI-NETI: layers, each examined and set aside; the knowing is not one of them. */
function NetiNeti({ g }: { g: G }) {
  const layers = [g.gIdentity, g.gThought, g.gEmotion, g.gSensation, g.gBody];
  return (
    <svg className="ns-graphic" viewBox="0 0 400 400" role="img" aria-label={`${layers.join(' · ')} → ${g.gAwareness}`}>
      {layers.map((l, i) => {
        const r = 170 - i * 28;
        return (
          <g key={l} className="ns-peel" style={{ animationDelay: `${(layers.length - 1 - i) * 1.6}s` }}>
            <circle cx="200" cy="200" r={r} fill="none" stroke={LINE} strokeWidth="1" />
            <text x="200" y={200 - r + 18} fill={SOFT} fontSize="13" textAnchor="middle">{l}</text>
          </g>
        );
      })}
      <circle cx="200" cy="200" r="6" fill={GOLD} />
      <text x="200" y="228" fill={GOLD} fontSize="14" textAnchor="middle">{g.gAwareness}</text>
    </svg>
  );
}

/** EXPERIENCE: something appears, changes and goes; the field it appears in stays. */
function Experience({ g }: { g: G }) {
  return (
    <svg className="ns-graphic" viewBox="0 0 400 400" role="img" aria-label={`${g.gExperience} · ${g.gAwareness}`}>
      <rect x="40" y="60" width="320" height="280" rx="18" fill="rgba(233,200,117,0.03)" stroke={FAINT} />
      {[0, 1, 2].map((i) => (
        <g key={i} className="ns-fade-cycle" style={{ animationDelay: `${i * 3}s` }}>
          <circle cx={130 + i * 70} cy={170 + (i % 2) * 50} r={26 + i * 6} fill="none" stroke={SOFT} strokeWidth="1.2" />
          <text x={130 + i * 70} y={170 + (i % 2) * 50 + 4} fill={SOFT} fontSize="12" textAnchor="middle">{g.gExperience}</text>
        </g>
      ))}
      <text x="200" y="320" fill={GOLD} fontSize="14" textAnchor="middle">{g.gAwareness}</text>
    </svg>
  );
}

/** EXPERIENCER: experiences move; attention turns toward the one they seem to happen to — which is itself seen. */
function Experiencer({ g }: { g: G }) {
  return (
    <svg className="ns-graphic" viewBox="0 0 400 400" role="img" aria-label={`${g.gExperience} → ${g.gExperiencer} → ${g.gAwareness}`}>
      <circle cx="200" cy="200" r="160" fill="none" stroke={FAINT} />
      <g className="ns-orbit">{[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2; return <circle key={i} cx={r2(200 + Math.cos(a) * 160)} cy={r2(200 + Math.sin(a) * 160)} r="5" fill={SOFT} />; })}</g>
      <circle cx="200" cy="200" r="52" fill="none" stroke={LINE} strokeDasharray="3 5" className="ns-float" />
      <text x="200" y="160" fill={SOFT} fontSize="13" textAnchor="middle">{g.gExperiencer}</text>
      <path d="M200 120 V 186" stroke={LINE} strokeDasharray="2 4" />
      <circle cx="200" cy="200" r="6" fill={GOLD} />
      <text x="200" y="230" fill={GOLD} fontSize="14" textAnchor="middle">{g.gAwareness}</text>
      <text x="200" y="372" fill={SOFT} fontSize="12" textAnchor="middle">{g.gExperience}</text>
    </svg>
  );
}

/** SELF-INQUIRY: “I” → identity → observer → inquiry → silence, along a path that ends. */
function SelfInquiry({ g }: { g: G }) {
  const steps = [g.gI, g.gIdentity, g.gObserver, g.gInquiry, g.gSilence];
  return (
    <svg className="ns-graphic" viewBox="0 0 400 400" role="img" aria-label={steps.join(' → ')}>
      <path d="M40 330 C 120 330, 120 230, 200 230 S 280 130, 360 120" fill="none" stroke={LINE} strokeWidth="1.2" />
      {steps.map((s, i) => {
        const pts = [[40, 330], [120, 300], [200, 230], [280, 165], [360, 120]][i];
        const last = i === steps.length - 1;
        return (
          <g key={s} className="ns-fade-cycle" style={{ animationDelay: `${i * 1.1}s`, animationDuration: '11s' }}>
            <circle cx={pts[0]} cy={pts[1]} r={last ? 10 : 6} fill={last ? 'rgba(233,200,117,0.25)' : SOFT} stroke={last ? GOLD : 'none'} />
            <text x={pts[0]} y={pts[1] - 18} fill={last ? GOLD : SOFT} fontSize="13" textAnchor="middle">{s}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** NON-DUALITY: subject and object, the distinction examined, the separation softening into one field. */
function NonDual({ g }: { g: G }) {
  return (
    <svg className="ns-graphic" viewBox="0 0 400 400" role="img" aria-label={`${g.gSubject} · ${g.gSeen}`}>
      <circle cx="200" cy="200" r="168" fill="rgba(233,200,117,0.03)" stroke={FAINT} />
      <g className="ns-float"><circle cx="150" cy="200" r="70" fill="none" stroke={LINE} /><text x="150" y="204" fill={SOFT} fontSize="13" textAnchor="middle">{g.gSubject}</text></g>
      <g className="ns-float" style={{ animationDelay: '-5s' }}><circle cx="250" cy="200" r="70" fill="none" stroke={LINE} /><text x="250" y="204" fill={SOFT} fontSize="13" textAnchor="middle">{g.gSeen}</text></g>
      <circle cx="200" cy="200" r="168" fill="none" stroke="rgba(233,200,117,0.35)" strokeDasharray="1 7" style={{ transformOrigin: '200px 200px', animation: 'ns-spin 120s linear infinite' }} />
    </svg>
  );
}

const BY_STAGE: Record<number, (p: { g: G }) => React.ReactElement> = {
  1: NetiNeti, 2: SelfInquiry, 3: SeerSeen, 4: NetiNeti, 5: SelfInquiry, 6: Experience, 7: NonDual, 8: NetiNeti, 9: SeerSeen,
  10: Experience, 11: Experiencer, 12: SelfInquiry, 13: SeerSeen, 14: NonDual, 15: Experiencer, 16: NonDual, 17: NonDual,
};
export function ConceptGraphic({ stage, g }: { stage: number; g: G }) {
  const C = BY_STAGE[stage] ?? SeerSeen;
  return <C g={g} />;
}

/** The moving geometry of the film placeholder. */
export function FilmGeometry({ n }: { n: number }) {
  return (
    <svg className="ns-ph-geo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="ns-ph-glow" cx="50%" cy="45%" r="50%"><stop offset="0%" stopColor="rgba(233,200,117,0.18)" /><stop offset="100%" stopColor="rgba(233,200,117,0)" /></radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#ns-ph-glow)" />
      <g className="ns-spin-slow">{[140, 220, 300, 380].map((r, i) => <circle key={r} cx="800" cy="450" r={r} fill="none" stroke={i % 2 ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.16)'} strokeDasharray={i % 2 ? '2 10' : undefined} />)}</g>
      <g className="ns-spin-rev">{Array.from({ length: 17 }, (_, i) => { const a = (i / 17) * Math.PI * 2; return <circle key={i} cx={r2(800 + Math.cos(a) * 300)} cy={r2(450 + Math.sin(a) * 300)} r={i === n - 1 ? 5 : 2} fill={i === n - 1 ? GOLD : 'rgba(233,200,117,0.35)'} />; })}</g>
      <path d="M0 640 H1600" stroke="rgba(243,234,212,0.06)" />
      <g className="ns-drift"><circle cx="800" cy="450" r="5" fill={GOLD} /></g>
    </svg>
  );
}
