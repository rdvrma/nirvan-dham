'use client';

// ═══════════════════════════════════════════════════
//  SacredBackground — Reusable sacred visual effects
//  Each "variant" gives a completely unique feel
// ═══════════════════════════════════════════════════

type Variant =
  | 'mandala'      // Splash — concentric rings + Om glow
  | 'lotus'        // Hero — petals + ripple + particles
  | 'chakra'       // Pillars — 8-spoke wheel
  | 'sri-yantra'   // Path — triangles + rings
  | 'om-field'     // AI Guide — Om field glow
  | 'cosmos'       // YouTube — star field
  | 'river'        // Guidance — flowing energy lines
  | 'seed'         // App — seed of life pattern
  | 'minimal';     // Footer — simple rings

interface Props {
  variant?: Variant;
  intensity?: 'soft' | 'medium' | 'strong';
}

export default function SacredBackground({ variant = 'mandala', intensity = 'soft' }: Props) {
  const op = intensity === 'soft' ? 0.06 : intensity === 'medium' ? 0.1 : 0.15;

  switch (variant) {

    // ── MANDALA: Splash / general ──
    case 'mandala':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Central glow orb */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)',
              animation: 'breathe 5s ease-in-out infinite',
            }} />
          </div>
          {/* Concentric rings — 5 layers */}
          {[700, 560, 420, 280, 140].map((size, i) => (
            <div key={size} className="absolute inset-0 flex items-center justify-center">
              <div style={{
                width: `min(${size}px, ${size / 8}vw + ${size * 0.5}px)`,
                height: `min(${size}px, ${size / 8}vw + ${size * 0.5}px)`,
                borderRadius: '50%',
                border: `1px solid rgba(212,168,67,${op * (i % 2 === 0 ? 1.5 : 1)})`,
                animation: `${i % 2 === 0 ? 'sacredSpin' : 'sacredSpinRev'} ${30 + i * 15}s linear infinite`,
              }} />
            </div>
          ))}
          {/* Dashed ring */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="dashed-ring" style={{
              width: '340px', height: '340px',
              animation: 'sacredSpin 20s linear infinite',
            }} />
          </div>
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{
              width: '3px', height: '3px',
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              opacity: 0.4 + (i * 0.05),
              animationDuration: `${4 + i * 1.2}s`,
              animationDelay: `${i * 0.8}s`,
            }} />
          ))}
        </div>
      );

    // ── LOTUS: Hero section ──
    case 'lotus':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Big center petal glow */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="petal-glow" style={{
              width: '500px', height: '500px',
              animationDuration: '7s',
            }} />
          </div>
          {/* Ripple rings — expanding outward */}
          {[0, 1.5, 3].map((delay, i) => (
            <div key={i} className="absolute inset-0 flex items-center justify-center">
              <div className="ripple-ring" style={{
                width: `${120 + i * 40}px`,
                height: `${120 + i * 40}px`,
                animationDelay: `${delay}s`,
                animationDuration: '5s',
              }} />
            </div>
          ))}
          {/* Floating gold particles — like fireflies */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${5 + i * 8}%`,
              top: `${10 + (i % 4) * 22}%`,
              opacity: 0.3 + (i % 4) * 0.12,
              animationDuration: `${3 + (i % 5)}s`,
              animationDelay: `${(i % 6) * 0.6}s`,
            }} />
          ))}
          {/* Outer sacred rings */}
          {[680, 480, 300].map((size, i) => (
            <div key={size} className="absolute inset-0 flex items-center justify-center">
              <div style={{
                width: `min(${size}px, 90vw)`,
                height: `min(${size}px, 90vw)`,
                borderRadius: '50%',
                border: `1px solid rgba(212,168,67,${op + i * 0.01})`,
                animation: `${i % 2 === 0 ? 'sacredSpin' : 'sacredSpinRev'} ${40 + i * 20}s linear infinite`,
              }} />
            </div>
          ))}
          {/* Star dots in corners */}
          {[
            { top: '15%', left: '10%' }, { top: '20%', right: '12%' },
            { bottom: '25%', left: '8%' }, { bottom: '18%', right: '9%' },
            { top: '45%', left: '4%' },   { top: '40%', right: '5%' },
          ].map((pos, i) => (
            <div key={i} className="star-dot" style={{
              width: '3px', height: '3px',
              ...pos,
              animationDuration: `${2 + i * 0.7}s`,
              animationDelay: `${i * 0.4}s`,
            }} />
          ))}
        </div>
      );

    // ── CHAKRA: Pillars section — 8-spoke wheel ──
    case 'chakra':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* SVG 8-spoke Dharmachakra */}
          <div className="absolute" style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(600px, 80vw)',
            height: 'min(600px, 80vw)',
            opacity: op,
            animation: 'sacredSpin 60s linear infinite',
          }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="95" stroke="#d4a843" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="70" stroke="#d4a843" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="20" stroke="#d4a843" strokeWidth="0.5" />
              {/* 8 spokes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = 100 + 20 * Math.cos(rad);
                const y1 = 100 + 20 * Math.sin(rad);
                const x2 = 100 + 94 * Math.cos(rad);
                const y2 = 100 + 94 * Math.sin(rad);
                return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4a843" strokeWidth="0.5" />;
              })}
              {/* Hub dots */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 100 + 70 * Math.cos(rad);
                const cy = 100 + 70 * Math.sin(rad);
                return <circle key={angle} cx={cx} cy={cy} r="3" stroke="#d4a843" strokeWidth="0.5" fill="none" />;
              })}
            </svg>
          </div>
          {/* Counter-rotating outer ring */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="dashed-ring" style={{
              width: 'min(650px, 85vw)',
              height: 'min(650px, 85vw)',
              animation: 'sacredSpinRev 45s linear infinite',
            }} />
          </div>
          {/* Energy lines sweeping across */}
          {[25, 50, 75].map((top, i) => (
            <div key={i} className="energy-line" style={{
              top: `${top}%`,
              left: 0,
              right: 0,
              animationDelay: `${i * 1.8}s`,
              animationDuration: '6s',
            }} />
          ))}
          {/* Corner star dots */}
          {[
            { top: '10%', left: '5%' }, { top: '10%', right: '5%' },
            { bottom: '10%', left: '5%' }, { bottom: '10%', right: '5%' },
          ].map((pos, i) => (
            <div key={i} className="star-dot" style={{
              width: '4px', height: '4px',
              ...pos,
              animationDuration: `${1.5 + i * 0.5}s`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>
      );

    // ── SRI YANTRA: Path / Journey section ──
    case 'sri-yantra':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Sri Yantra triangle pattern */}
          <div className="absolute" style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(500px, 70vw)',
            height: 'min(500px, 70vw)',
            opacity: op * 1.2,
          }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer circles */}
              <circle cx="100" cy="100" r="98" stroke="#d4a843" strokeWidth="0.4" />
              <circle cx="100" cy="100" r="88" stroke="#d4a843" strokeWidth="0.3" />
              {/* Triangle pointing up */}
              <polygon points="100,15 178,155 22,155" stroke="#d4a843" strokeWidth="0.5" fill="none" />
              {/* Triangle pointing down */}
              <polygon points="100,185 22,45 178,45" stroke="#d4a843" strokeWidth="0.5" fill="none" />
              {/* Inner triangle up */}
              <polygon points="100,40 160,140 40,140" stroke="#d4a843" strokeWidth="0.4" fill="none" />
              {/* Inner triangle down */}
              <polygon points="100,160 40,60 160,60" stroke="#d4a843" strokeWidth="0.4" fill="none" />
              {/* Bindu center */}
              <circle cx="100" cy="100" r="4" stroke="#d4a843" strokeWidth="0.8" fill="none" />
              <circle cx="100" cy="100" r="1.5" fill="#d4a843" opacity="0.8" />
            </svg>
          </div>
          {/* Slow rotating outer ring */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 'min(560px, 80vw)',
              height: 'min(560px, 80vw)',
              borderRadius: '50%',
              border: `1px solid rgba(212,168,67,${op})`,
              animation: 'sacredSpin 80s linear infinite',
            }} />
          </div>
          {/* Breathing petal glow */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="petal-glow" style={{
              width: '250px', height: '250px',
              animationDuration: '8s',
            }} />
          </div>
          {/* Floating particles — 4 corners */}
          {[
            { top: '20%', left: '15%' }, { top: '25%', right: '12%' },
            { bottom: '20%', left: '10%' }, { bottom: '22%', right: '14%' },
          ].map((pos, i) => (
            <div key={i} className="particle" style={{
              width: '3px', height: '3px', ...pos,
              animationDuration: `${3 + i}s`,
              animationDelay: `${i * 0.7}s`,
            }} />
          ))}
        </div>
      );

    // ── OM FIELD: AI Guide ──
    case 'om-field':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Large Om glow */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.04 }}>
            <span style={{
              fontSize: 'min(400px, 60vw)',
              color: 'var(--c-gold)',
              fontFamily: 'serif',
              lineHeight: 1,
              userSelect: 'none',
              animation: 'breathe 8s ease-in-out infinite',
            }}>
              ॐ
            </span>
          </div>
          {/* Ripple rings from center */}
          {[0, 2, 4, 6].map((delay, i) => (
            <div key={i} className="absolute inset-0 flex items-center justify-center">
              <div className="ripple-ring" style={{
                width: `${80 + i * 60}px`,
                height: `${80 + i * 60}px`,
                animationDelay: `${delay}s`,
                animationDuration: '6s',
              }} />
            </div>
          ))}
          {/* Slow outer rings */}
          {[500, 360].map((size, i) => (
            <div key={size} className="absolute inset-0 flex items-center justify-center">
              <div style={{
                width: `min(${size}px, 80vw)`,
                height: `min(${size}px, 80vw)`,
                borderRadius: '50%',
                border: `1px solid rgba(212,168,67,${op})`,
                animation: `${i % 2 === 0 ? 'sacredSpin' : 'sacredSpinRev'} ${50 + i * 20}s linear infinite`,
              }} />
            </div>
          ))}
          {/* Fine particle dust */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="star-dot" style={{
              width: '2px', height: '2px',
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDuration: `${2 + i * 0.5}s`,
              animationDelay: `${i * 0.35}s`,
            }} />
          ))}
        </div>
      );

    // ── COSMOS: YouTube / star field ──
    case 'cosmos':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Star field */}
          {[...Array(20)].map((_, i) => (
            <div key={i} className="star-dot" style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 17 + 5) % 95}%`,
              top: `${(i * 23 + 8) % 90}%`,
              animationDuration: `${1.5 + (i % 5) * 0.8}s`,
              animationDelay: `${(i % 7) * 0.3}s`,
            }} />
          ))}
          {/* Central nebula glow */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="petal-glow" style={{
              width: '400px', height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(212,168,67,0.06) 0%, transparent 70%)',
              animationDuration: '9s',
            }} />
          </div>
          {/* Slow ring */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="dashed-ring" style={{
              width: 'min(500px, 75vw)',
              height: 'min(500px, 75vw)',
              animation: 'sacredSpin 120s linear infinite',
            }} />
          </div>
          {/* Energy sweep */}
          <div className="energy-line" style={{ top: '40%', left: 0, right: 0, animationDuration: '8s' }} />
        </div>
      );

    // ── RIVER: Guidance — flowing energy lines ──
    case 'river':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Large Om at center */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.05 }}>
            <span style={{
              fontSize: 'min(350px, 55vw)',
              color: 'var(--c-gold)',
              fontFamily: 'serif',
              lineHeight: 1,
              userSelect: 'none',
              animation: 'floatSlow 10s ease-in-out infinite',
            }}>
              ॐ
            </span>
          </div>
          {/* Multiple energy sweeps at different heights */}
          {[20, 40, 60, 80].map((top, i) => (
            <div key={i} className="energy-line" style={{
              top: `${top}%`, left: 0, right: 0,
              animationDelay: `${i * 1.5}s`,
              animationDuration: '7s',
              opacity: 0,
            }} />
          ))}
          {/* Big slow rings */}
          {[600, 400, 200].map((size, i) => (
            <div key={size} className="absolute inset-0 flex items-center justify-center">
              <div style={{
                width: `min(${size}px, 90vw)`,
                height: `min(${size}px, 90vw)`,
                borderRadius: '50%',
                border: `1px solid rgba(212,168,67,${op * (i === 0 ? 0.8 : 1.2)})`,
                animation: `${i % 2 === 0 ? 'sacredSpin' : 'sacredSpinRev'} ${60 + i * 30}s linear infinite`,
              }} />
            </div>
          ))}
          {/* Floating gold drops */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{
              width: '4px', height: '4px',
              left: `${15 + i * 14}%`,
              top: `${30 + (i % 3) * 15}%`,
              animationDuration: `${5 + i}s`,
              animationDelay: `${i * 0.9}s`,
            }} />
          ))}
        </div>
      );

    // ── SEED: App section — seed of life geometry ──
    case 'seed':
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div className="absolute" style={{
            top: '50%', right: '10%',
            transform: 'translateY(-50%)',
            width: 'min(300px, 40vw)',
            height: 'min(300px, 40vw)',
            opacity: op * 1.5,
            animation: 'sacredSpin 90s linear infinite',
          }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Seed of life — 7 circles */}
              <circle cx="100" cy="100" r="40" stroke="#d4a843" strokeWidth="0.6" />
              <circle cx="100" cy="60"  r="40" stroke="#d4a843" strokeWidth="0.6" />
              <circle cx="100" cy="140" r="40" stroke="#d4a843" strokeWidth="0.6" />
              <circle cx="134.6" cy="80" r="40" stroke="#d4a843" strokeWidth="0.6" />
              <circle cx="65.4" cy="80"  r="40" stroke="#d4a843" strokeWidth="0.6" />
              <circle cx="134.6" cy="120" r="40" stroke="#d4a843" strokeWidth="0.6" />
              <circle cx="65.4" cy="120" r="40" stroke="#d4a843" strokeWidth="0.6" />
            </svg>
          </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="petal-glow" style={{
              width: '350px', height: '350px',
              animationDuration: '6s',
            }} />
          </div>
          {/* Simple dashed ring */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="dashed-ring" style={{
              width: 'min(400px, 70vw)',
              height: 'min(400px, 70vw)',
              animation: 'sacredSpinRev 50s linear infinite',
            }} />
          </div>
        </div>
      );

    // ── MINIMAL: Footer ──
    case 'minimal':
    default:
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 'min(500px, 80vw)',
              height: 'min(500px, 80vw)',
              borderRadius: '50%',
              border: `1px solid rgba(212,168,67,${op * 0.6})`,
              animation: 'sacredSpin 120s linear infinite',
            }} />
          </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 'min(300px, 50vw)',
              height: 'min(300px, 50vw)',
              borderRadius: '50%',
              border: `1px solid rgba(212,168,67,${op})`,
              animation: 'sacredSpinRev 80s linear infinite',
            }} />
          </div>
        </div>
      );
  }
}
