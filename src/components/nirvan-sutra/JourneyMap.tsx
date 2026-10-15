// The seventeen stages as one contemplative path: a slow curve on wide screens, a quiet vertical line on phones.
// States: locked (visible, dashed), current (breathing light), available, completed (settled gold) — no badges, no scores.
import Link from 'next/link';
import type { StageState } from '@/course/nirvan-sutra/engine';
import type { MovementId } from '@/course/nirvan-sutra/types';

export interface MapStage { id: string; n: number; title: string; inquiry: string; state: StageState; movement: MovementId }
export interface MapMovement { id: MovementId; title: string; label: string }

const W = 1000, STEP = 104, HEAD = 92, TOP = 40;
const xOf = (i: number) => 500 + Math.sin(i * 0.78) * 210;

export default function JourneyMap({ stages, movements, base, ui }: { stages: MapStage[]; movements: MapMovement[]; base: string; ui: Record<string, string> }) {
  // positions, with room above the first stage of each movement for its title
  let y = TOP;
  const pts: { x: number; y: number; s: MapStage }[] = [];
  const heads: { y: number; m: MapMovement; y2: number }[] = [];
  stages.forEach((s, i) => {
    if (i === 0 || stages[i - 1].movement !== s.movement) { heads.push({ y, m: movements.find((m) => m.id === s.movement)!, y2: 0 }); y += HEAD; }
    pts.push({ x: xOf(i), y, s });
    y += STEP;
    heads[heads.length - 1].y2 = y - STEP / 2;
  });
  const H = y + 20;
  const curve = (list: typeof pts) => list.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const a = list[i - 1], my = (a.y + p.y) / 2;
    return `C ${a.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  }).join(' ');
  const doneUntil = (() => { let k = -1; pts.forEach((p, i) => { if (p.s.state === 'completed') k = i; }); return k; })();
  const donePts = doneUntil >= 0 ? pts.slice(0, Math.min(pts.length, doneUntil + 2)) : [];
  const len = donePts.length * STEP * 1.25 + 200;

  return (
    <div className="ns-map">
      <div className="ns-map-desktop">
        <svg className="ns-map-svg" viewBox={`0 0 ${W} ${H}`} role="list" aria-label={ui.journeyMap}>
          {heads.map((h, i) => (
            <g key={h.m.id} aria-hidden="true">
              <rect className="ns-move-band" x="40" y={h.y - 16} width={W - 80} height={h.y2 - h.y + 30} rx="28" />
              <text className="ns-move-label" x="72" y={h.y + 16}>{['I', 'II', 'III', 'IV'][i]}</text>
              <text className="ns-move-title" x="104" y={h.y + 17}>{h.m.title}</text>
            </g>
          ))}
          <path className="ns-map-path" d={curve(pts)} />
          {donePts.length > 1 && <path className="ns-map-path-done" d={curve(donePts)} style={{ ['--len' as string]: len }} />}
          {pts.map(({ x, y: py, s }) => {
            const right = x < 500;
            const node = (
              <g className="ns-node" data-state={s.state}>
                {s.state === 'current' && <circle className="ns-node-halo" cx={x} cy={py} r="26" />}
                <circle className="ns-node-ring" cx={x} cy={py} r="20" />
                {s.state === 'completed'
                  ? <path className="ns-check-mark" d={`M ${x - 6} ${py} l 4.5 4.5 l 8 -9`} />
                  : <text className="ns-node-num" x={x} y={py}>{String(s.n).padStart(2, '0')}</text>}
                <text className="ns-node-label" x={right ? x + 36 : x - 36} y={py - 2} textAnchor={right ? 'start' : 'end'}>{s.title}</text>
                <text className="ns-node-sub" x={right ? x + 36 : x - 36} y={py + 20} textAnchor={right ? 'start' : 'end'}>{trim(s.inquiry, 46)}</text>
              </g>
            );
            const label = `${ui.stageN?.replace('{n}', String(s.n))} · ${s.title} · ${ui[s.state]}`;
            return s.state === 'locked'
              ? <g key={s.id} role="listitem" aria-label={label}>{node}</g>
              : <a key={s.id} href={`${base}/stage/${s.id}`} role="listitem" aria-label={label}>{node}</a>;
          })}
        </svg>
      </div>
      <ol className="ns-vmap ns-map-mobile" aria-label={ui.journeyMap}>
        {stages.map((s, i) => (
          <li key={s.id}>
            {(i === 0 || stages[i - 1].movement !== s.movement) && (
              <div className="ns-vmove"><div className="ns-eyebrow">{movements.find((m) => m.id === s.movement)?.label}</div><div className="ns-h3" style={{ fontSize: '1.05rem' }}>{movements.find((m) => m.id === s.movement)?.title}</div></div>
            )}
            <div className="ns-vstage" data-state={s.state}>
              <span className="ns-vdot" aria-hidden="true">{s.state === 'completed' ? '✓' : String(s.n).padStart(2, '0')}</span>
              <div>
                {s.state === 'locked'
                  ? <div className="ns-vtitle">{s.title}</div>
                  : <Link href={`${base}/stage/${s.id}`} className="ns-vtitle">{s.title}</Link>}
                <div className="ns-small ns-muted">{s.inquiry}</div>
                <span className="ns-sr">{ui[s.state]}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const trim = (s: string, n: number) => ([...s].length > n ? `${[...s].slice(0, n - 1).join('')}…` : s);
