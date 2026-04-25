import React, { useState, useEffect, useRef } from 'react';

// ---------- Data ----------
const PANELS = [
  {
    id: 'planner',
    label: 'Planner',
    number: '01',
    tagline: 'Order from the everyday',
    hue: '#FF7A45',
    description: 'Lay out your days the way you\'d arrange a quiet room — with care, with breathing space, with a place for everything.',
  },
  {
    id: 'journal',
    label: 'Journal',
    number: '02',
    tagline: 'A page that listens',
    hue: '#E85D2F',
    description: 'Write it out. Fragments, lists, long letters to no one. Your thoughts stay yours — encrypted, local, calm.',
  },
  {
    id: 'workout',
    label: 'Workout log',
    number: '03',
    tagline: 'Small motions, stacked',
    hue: '#D94A20',
    description: 'Track sets, reps, walks, stretches. No shouting coaches. Just a gentle record of what your body did today.',
  },
  {
    id: 'notecards',
    label: 'Notecards',
    number: '04',
    tagline: 'Ideas, one at a time',
    hue: '#FF8C5A',
    description: 'Capture thoughts on small cards. Shuffle them, group them, rediscover them. A quiet way to think slowly.',
  },
  {
    id: 'diary',
    label: 'Diary',
    number: '05',
    tagline: 'The record of your days',
    hue: '#F2633A',
    description: 'A dated companion. Some days a sentence, some days a page. The shape of your life, kept close.',
  },
];

// ---------- Shared Styles ----------
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter+Tight:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body, #root {
      background: #F6F1EA;
      color: #2B1F17;
      font-family: 'Inter Tight', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .display { font-family: 'Fraunces', serif; font-style: italic; }
    .mono { font-family: 'Inter Tight', monospace; letter-spacing: 0.08em; text-transform: uppercase; font-size: 11px; font-weight: 500; }

    .grain::before {
      content: '';
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: 1; /* was 100, panels appear above the grain layer now */
      opacity: 0.35;
      mix-blend-mode: multiply;
      background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.12 0 0 0 0 0.09 0 0 0 0.25 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    }

    @keyframes scroll-x {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes soft-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .fade-up { animation: fade-up 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

    button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
    a { color: inherit; text-decoration: none; }

    ::selection { background: #FF7A45; color: #F6F1EA; }
  `}</style>
);

// ---------- Nav ----------
const Nav = ({ onNav, current }) => {
  const isLogin = current === 'login';
  const isHome = current === 'home';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '24px 40px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'linear-gradient(to bottom, rgba(246,241,234,0.95), rgba(246,241,234,0))',
      backdropFilter: 'blur(8px)',
    }}>
      <button onClick={() => onNav('home')} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M2 12 L11 3 L20 12 L20 20 L2 20 Z" stroke="#2B1F17" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="11" cy="14" r="2" fill="#FF7A45"/>
        </svg>
        <span className="display" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>
          NookEase
        </span>
      </button>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span className="mono" style={{ color: '#8A7668' }}>
          {isHome ? 'Index' : isLogin ? 'Sign in' : `${PANELS.findIndex(p => p.id === current) + 1} / ${PANELS.length}`}
        </span>

        {/* Log in — text button */}
        {!isLogin && (
          <button onClick={() => onNav('login')} className="mono" style={{
            padding: '10px 4px',
            color: '#2B1F17',
            position: 'relative',
          }}
          onMouseEnter={e => e.currentTarget.querySelector('.underline').style.transform = 'scaleX(1)'}
          onMouseLeave={e => e.currentTarget.querySelector('.underline').style.transform = 'scaleX(0)'}
          >
            Log in
            <span className="underline" style={{
              position: 'absolute', bottom: 6, left: 4, right: 4, height: 1,
              background: '#2B1F17',
              transform: 'scaleX(0)', transformOrigin: 'left',
              transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
            }}/>
          </button>
        )}

        {/* Primary CTA */}
        <button onClick={() => onNav(isLogin ? 'home' : 'home')} className="mono" style={{
          padding: '10px 18px',
          border: '1px solid #2B1F17',
          borderRadius: 999,
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#2B1F17'; e.currentTarget.style.color = '#F6F1EA'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2B1F17'; }}
        >
          {isHome ? 'Get Early Access' : isLogin ? '← Back home' : '← Back to Index'}
        </button>
      </div>
    </nav>
  );
};

// ---------- Panel Card (used in carousel) ----------
const PanelCard = ({ panel, onClick, isPaused }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onClick(panel.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '0 0 auto',
        width: 340, height: 460,
        margin: '0 14px',
        borderRadius: 24,
        background: '#FFFDFA',
        border: '1px solid rgba(43,31,23,0.08)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left',
        padding: 28,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'transform 0.5s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.5s, border-color 0.5s',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 30px 60px -20px ${panel.hue}55, 0 12px 24px -12px rgba(43,31,23,0.18)`
          : '0 2px 8px rgba(43,31,23,0.04)',
        borderColor: hovered ? panel.hue : 'rgba(43,31,23,0.08)',
      }}
    >
      {/* Warm gradient wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(120% 80% at 100% 0%, ${panel.hue}22, transparent 60%)`,
        opacity: hovered ? 1 : 0.7,
        transition: 'opacity 0.5s',
        pointerEvents: 'none',
      }}/>

      {/* Top: number + label */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <span className="mono" style={{ color: '#8A7668' }}>{panel.number}</span>
        <span className="mono" style={{ color: panel.hue }}>Feature</span>
      </div>

      {/* Center: the panel illustration */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
        <PanelIllustration id={panel.id} hue={panel.hue} hovered={hovered}/>
      </div>

      {/* Bottom: title + arrow */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="display" style={{
          fontSize: 42, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1,
          color: '#2B1F17',
        }}>
          {panel.label}
        </div>
        <div style={{
          marginTop: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, color: '#5C4A3E', fontStyle: 'italic' }}>
            {panel.tagline}
          </span>
          <span style={{
            width: 32, height: 32, borderRadius: '50%',
            background: panel.hue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: hovered ? 'translateX(4px) rotate(-45deg)' : 'rotate(0)',
            transition: 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="#FFFDFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
};

// ---------- Per-panel illustrations (unique for each) ----------
const PanelIllustration = ({ id, hue, hovered }) => {
  const common = { width: 220, height: 220 };

  if (id === 'planner') return (
    <svg {...common} viewBox="0 0 220 220">
      <rect x="20" y="30" width="180" height="170" rx="10" fill="#FFFDFA" stroke="#2B1F17" strokeWidth="1.5"/>
      <line x1="20" y1="60" x2="200" y2="60" stroke="#2B1F17" strokeWidth="1"/>
      <circle cx="40" cy="45" r="4" fill={hue}/>
      <rect x="55" y="42" width="80" height="6" rx="1" fill="#2B1F17" opacity="0.6"/>
      {[80, 105, 130, 155, 180].map((y, i) => (
        <g key={i}>
          <rect x="35" y={y-5} width="10" height="10" rx="2" fill={i < 2 ? hue : 'none'} stroke="#2B1F17" strokeWidth="1.2"/>
          <rect x="55" y={y-2} width={120 - i*15} height="4" rx="1" fill="#2B1F17" opacity={0.3 + i*0.1}/>
        </g>
      ))}
    </svg>
  );

  if (id === 'workout') return (
    <svg {...common} viewBox="0 0 220 220">
      {[0,1,2,3,4,5,6].map(i => {
        const h = [40, 70, 55, 90, 75, 110, 85][i];
        return (
          <rect key={i} x={30 + i*24} y={180 - h} width="16" height={h} rx="3"
                fill={i === 5 ? hue : '#2B1F17'} opacity={i === 5 ? 1 : 0.85 - i*0.05}/>
        );
      })}
      <line x1="25" y1="182" x2="200" y2="182" stroke="#2B1F17" strokeWidth="1.5"/>
      <circle cx="170" cy="50" r="20" fill={hue} opacity="0.2"/>
      <circle cx="170" cy="50" r="12" fill={hue}/>
      <path d="M165 50 L169 54 L176 46" stroke="#FFFDFA" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );

  if (id === 'journal') return (
    <svg {...common} viewBox="0 0 220 220">
      <rect x="40" y="30" width="140" height="170" rx="4" fill="#FFFDFA" stroke="#2B1F17" strokeWidth="1.5"/>
      <line x1="60" y1="30" x2="60" y2="200" stroke={hue} strokeWidth="1" strokeDasharray="3 3"/>
      {[55, 75, 95, 115, 135].map((y, i) => (
        <path key={i} d={`M 70 ${y} Q ${100 + Math.sin(i)*20} ${y-3} ${160 - i*8} ${y}`}
              stroke="#2B1F17" strokeWidth="1.2" fill="none" opacity={0.7 - i*0.1}/>
      ))}
      <circle cx="155" cy="165" r="8" fill={hue}/>
      <path d="M150 168 L154 172 L160 162" stroke="#FFFDFA" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );

if (id === 'notecards') return (
  <svg {...common} viewBox="0 0 220 220">
    {[
      { x: 30, y: 50, rot: -6 },
      { x: 70, y: 40, rot: 3 },
      { x: 110, y: 55, rot: -2 },
    ].map((c, i) => (
      <g key={i} transform={`rotate(${c.rot} ${c.x + 40} ${c.y + 50})`}>
        <rect x={c.x} y={c.y} width="80" height="100" rx="6"
              fill="#FFFDFA" stroke="#2B1F17" strokeWidth="1.5"/>
        <line x1={c.x + 10} y1={c.y + 20} x2={c.x + 60} y2={c.y + 20}
              stroke={hue} strokeWidth="2"/>
        {[40, 55, 70, 85].map((y, j) => (
          <line key={j} x1={c.x + 10} y1={c.y + y}
                x2={c.x + 70 - j*8} y2={c.y + y}
                stroke="#2B1F17" strokeWidth="1" opacity={0.4 - j*0.05}/>
        ))}
      </g>
    ))}
  </svg>
);

if (id === 'diary') return (
  <svg {...common} viewBox="0 0 220 220">
    <rect x="30" y="35" width="160" height="160" rx="6" fill="#FFFDFA" stroke="#2B1F17" strokeWidth="1.5"/>
    <rect x="30" y="35" width="160" height="28" fill={hue} opacity="0.15"/>
    <text x="45" y="54" fontFamily="Fraunces" fontSize="14" fontStyle="italic" fill="#2B1F17">Thursday</text>
    <circle cx="165" cy="49" r="4" fill={hue}/>
    {[80, 100, 120, 140, 160, 180].map((y, i) => (
      <line key={i} x1="45" y1={y} x2={185 - i*12} y2={y}
            stroke="#2B1F17" strokeWidth="1" opacity={0.35 + (i%2)*0.2}/>
    ))}
    <path d="M 45 175 Q 60 170 75 176" stroke={hue} strokeWidth="1.5" fill="none"/>
  </svg>
);

  return null;
};

// ---------- Carousel ----------
const Carousel = ({ onSelect }) => {
  const [paused, setPaused] = useState(false);
  const doubled = [...PANELS, ...PANELS];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        padding: '40px 0',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: 'scroll-x 60s linear infinite',
        animationPlayState: paused ? 'paused' : 'running',
      }}>
        {doubled.map((p, i) => (
          <PanelCard key={`${p.id}-${i}`} panel={p} onClick={onSelect}/>
        ))}
      </div>
    </div>
  );
};

// ---------- Home Page ----------
const HomePage = ({ onSelect }) => (
  <div className="fade-up" style={{ paddingTop: 120, minHeight: '100vh' }}>
    {/* Hero text */}
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 40px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 40 }}>
        <div style={{ maxWidth: 720 }}>
          <span className="mono" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 999,
            background: 'rgba(255,122,69,0.12)', color: '#D94A20',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D94A20', animation: 'soft-pulse 2s ease-in-out infinite' }}/>
            Now in private beta
          </span>
          <h1 style={{
            marginTop: 24,
            fontSize: 'clamp(56px, 9vw, 128px)',
            lineHeight: 0.92,
            letterSpacing: '-0.045em',
            fontWeight: 400,
            color: '#2B1F17',
          }}>
            The quiet<br/>
            <span className="display" style={{ fontWeight: 300, color: '#D94A20' }}>corner</span> of<br/>
            your day.
          </h1>
        </div>
        <div style={{ maxWidth: 360, paddingBottom: 12 }}>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: '#5C4A3E' }}>
            NookEase is a gentle companion for the small rituals of daily life —
            planning, moving, writing, resting. One unhurried app, seven quiet rooms.
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button style={{
              padding: '14px 22px', borderRadius: 999,
              background: '#2B1F17', color: '#F6F1EA',
              fontSize: 14, fontWeight: 500,
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#D94A20'}
            onMouseLeave={e => e.currentTarget.style.background = '#2B1F17'}
            >
              Join the beta →
            </button>
            <button style={{
              padding: '14px 22px', borderRadius: 999,
              border: '1px solid rgba(43,31,23,0.2)',
              fontSize: 14, fontWeight: 500,
            }}>
              Watch film
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Section label */}
    <div style={{
      maxWidth: 1200, margin: '0 auto', padding: '60px 40px 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span className="mono" style={{ color: '#8A7668' }}>— 02 · Seven rooms</span>
      <span className="mono" style={{ color: '#8A7668' }}>Hover to pause · Click to enter</span>
    </div>

    {/* Auto-scrolling carousel */}
    <Carousel onSelect={onSelect}/>

    {/* Footer strip */}
    <div style={{
      maxWidth: 1200, margin: '40px auto 0', padding: '60px 40px',
      borderTop: '1px solid rgba(43,31,23,0.1)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
    }}>
      <div className="display" style={{ fontSize: 28, fontStyle: 'italic', fontWeight: 300, color: '#2B1F17', maxWidth: 500, lineHeight: 1.3 }}>
        "Software that feels like a deep breath."
      </div>
      <span className="mono" style={{ color: '#8A7668' }}>© NookEase 2026 · Made slowly</span>
    </div>
  </div>
);

// ============================================================
// ---------- Interactive panel pages (Planner / Journal / Workout)
// ============================================================
//
// Each page is self-contained:
//   • reads/writes its own slice of localStorage so data survives reloads
//   • shares the warm palette (#F6F1EA bg, #FF7A45/#D94A20 accents)
//   • uses the same .display / .mono / serif headings as the rest of the site
//
// Storage keys (all under one namespace so they're easy to wipe later):
//   nookease:planner   -> array of events
//   nookease:journal   -> { pages: [...], activeId: '...' }
//   nookease:workout   -> array of cardio sessions
// ------------------------------------------------------------

const STORAGE = {
  planner: 'nookease:planner',
  journal: 'nookease:journal',
  workout: 'nookease:workout',
};

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const saveJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// Small reusable header that mirrors the FeaturePage breadcrumb/hero feel
// but stays compact so the actual tool gets the room.
const PanelHeader = ({ panel, onNav, subtitle }) => (
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 40px 24px' }}>
    <button
      onClick={() => onNav('home')}
      className="mono"
      style={{ color: '#8A7668', marginBottom: 18 }}
    >
      ← Index
    </button>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
      <span className="mono" style={{ color: panel.hue }}>{panel.number} · Feature</span>
      <h1 className="display" style={{
        fontSize: 'clamp(48px, 7vw, 84px)',
        fontWeight: 300, fontStyle: 'italic',
        lineHeight: 0.95, letterSpacing: '-0.03em',
        color: '#2B1F17',
      }}>
        {panel.label}.
      </h1>
    </div>
    {subtitle && (
      <p style={{ fontSize: 17, lineHeight: 1.5, color: '#5C4A3E', marginTop: 14, fontStyle: 'italic', maxWidth: 600 }}>
        {subtitle}
      </p>
    )}
  </div>
);

// ---------- Planner Page ----------
// Weekly grid: rows = hourly time slots, columns = Mon–Sun.
// User adds a (day, start, end, title) entry; it renders as a colored
// block on the grid spanning the right rows. Click a block to delete it.
const PlannerPage = ({ panel, onNav }) => {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // 6 AM through 11 PM is enough for most people without making the grid huge
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23

  const [events, setEvents] = useState(() => loadJSON(STORAGE.planner, []));
  const [draft, setDraft] = useState({
    day: 'Mon', start: '09:00', end: '10:00', title: '',
  });

  useEffect(() => { saveJSON(STORAGE.planner, events); }, [events]);

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const fmtHour = (h) => {
    const period = h >= 12 ? 'pm' : 'am';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ${period}`;
  };

  const addEvent = () => {
    if (!draft.title.trim()) return;
    if (toMinutes(draft.end) <= toMinutes(draft.start)) return;
    setEvents(prev => [
      ...prev,
      { id: Date.now() + Math.random(), ...draft, title: draft.title.trim() },
    ]);
    setDraft({ ...draft, title: '' });
  };

  const removeEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Each hour row is 56px tall; an event's vertical position/height is
  // computed from its start/end relative to the first hour (6 AM).
  const ROW_H = 56;
  const gridStartMin = HOURS[0] * 60;

  const eventStyle = (ev) => {
    const top = (toMinutes(ev.start) - gridStartMin) / 60 * ROW_H;
    const height = (toMinutes(ev.end) - toMinutes(ev.start)) / 60 * ROW_H;
    return { top: top + 4, height: Math.max(height - 6, 22) };
  };

  return (
    <div className="fade-up" style={{ paddingTop: 100, minHeight: '100vh' }}>
      <PanelHeader panel={panel} onNav={onNav} subtitle="Lay the week out softly. Drop in what matters; leave room for what doesn't yet have a name." />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 80px' }}>

        {/* Add-event row */}
        <div style={{
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 28,
          display: 'grid',
          gridTemplateColumns: '1fr 110px 110px 110px auto',
          gap: 12,
          alignItems: 'end',
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
        }}>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Title</label>
            <input
              value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') addEvent(); }}
              placeholder="e.g. morning walk, deep work, call mom"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Day</label>
            <select
              value={draft.day}
              onChange={e => setDraft({ ...draft, day: e.target.value })}
              style={inputStyle}
            >
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Start</label>
            <input
              type="time"
              value={draft.start}
              onChange={e => setDraft({ ...draft, start: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>End</label>
            <input
              type="time"
              value={draft.end}
              onChange={e => setDraft({ ...draft, end: e.target.value })}
              style={inputStyle}
            />
          </div>
          <button
            onClick={addEvent}
            className="mono"
            style={{
              padding: '12px 20px',
              borderRadius: 999,
              background: panel.hue,
              color: '#FFFDFA',
              height: 44,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px -8px ${panel.hue}88`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Add +
          </button>
        </div>

        {/* The grid */}
        <div style={{
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
        }}>
          {/* Day header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '70px repeat(7, 1fr)',
            borderBottom: '1px solid rgba(43,31,23,0.08)',
            background: 'rgba(255,122,69,0.04)',
          }}>
            <div /> {/* corner spacer */}
            {DAYS.map(d => (
              <div key={d} className="mono" style={{
                padding: '14px 0',
                textAlign: 'center',
                color: '#2B1F17',
                borderLeft: '1px solid rgba(43,31,23,0.06)',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Body: time labels on left, day columns with absolutely-positioned events on the right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '70px repeat(7, 1fr)',
            position: 'relative',
          }}>
            {/* Time-label column */}
            <div>
              {HOURS.map(h => (
                <div key={h} className="mono" style={{
                  height: ROW_H,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                  paddingRight: 10, paddingTop: 6,
                  color: '#8A7668',
                  borderBottom: '1px dashed rgba(43,31,23,0.06)',
                  fontSize: 10,
                }}>
                  {fmtHour(h)}
                </div>
              ))}
            </div>

            {/* Each day column */}
            {DAYS.map(day => {
              const dayEvents = events.filter(e => e.day === day);
              return (
                <div key={day} style={{
                  position: 'relative',
                  borderLeft: '1px solid rgba(43,31,23,0.06)',
                }}>
                  {HOURS.map(h => (
                    <div key={h} style={{
                      height: ROW_H,
                      borderBottom: '1px dashed rgba(43,31,23,0.06)',
                    }}/>
                  ))}
                  {dayEvents.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        if (window.confirm(`Remove "${ev.title}"?`)) removeEvent(ev.id);
                      }}
                      title="Click to remove"
                      style={{
                        position: 'absolute',
                        left: 4, right: 4,
                        ...eventStyle(ev),
                        background: panel.hue,
                        color: '#FFFDFA',
                        borderRadius: 8,
                        padding: '6px 8px',
                        fontSize: 12,
                        textAlign: 'left',
                        boxShadow: `0 4px 12px -4px ${panel.hue}aa`,
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span style={{ fontWeight: 600, lineHeight: 1.2 }}>{ev.title}</span>
                      <span className="mono" style={{ opacity: 0.85, fontSize: 9, marginTop: 2 }}>
                        {ev.start}–{ev.end}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mono" style={{ color: '#8A7668', marginTop: 16, textAlign: 'center' }}>
          {events.length === 0
            ? 'a quiet week. add your first block above.'
            : `${events.length} ${events.length === 1 ? 'block' : 'blocks'} · click any to remove`}
        </p>
      </div>
    </div>
  );
};

// Shared input style for the planner / workout forms
const inputStyle = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  background: '#F6F1EA',
  border: '1px solid rgba(43,31,23,0.1)',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#2B1F17',
  outline: 'none',
};

// ---------- Journal Page ----------
// iPhone-Notes-style: a list of titled pages on the left, an editable
// document on the right. Formatting toolbar (bold, italic, bullets, headings,
// font size) acts on the contentEditable area via document.execCommand.
//
// execCommand is technically deprecated but is the simplest cross-browser
// way to format contentEditable without a rich-text library, which we're
// avoiding to stay dependency-light.
const JournalPage = ({ panel, onNav }) => {
  const [data, setData] = useState(() => {
    const stored = loadJSON(STORAGE.journal, null);
    if (stored && stored.pages && stored.pages.length) return stored;
    const firstId = Date.now();
    return {
      pages: [{ id: firstId, title: 'untitled', html: '', updated: Date.now() }],
      activeId: firstId,
    };
  });

  const editorRef = useRef(null);
  const activePage = data.pages.find(p => p.id === data.activeId) || data.pages[0];

  // Persist on every change
  useEffect(() => { saveJSON(STORAGE.journal, data); }, [data]);

  // When you switch pages, swap the editor's HTML in (we keep it
  // uncontrolled to avoid the cursor jumping while typing).
  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.html) {
        editorRef.current.innerHTML = activePage.html || '';
      }
    }
  }, [data.activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateActive = (patch) => {
    setData(d => ({
      ...d,
      pages: d.pages.map(p => p.id === d.activeId ? { ...p, ...patch, updated: Date.now() } : p),
    }));
  };

  const newPage = () => {
    const id = Date.now();
    setData(d => ({
      pages: [{ id, title: 'untitled', html: '', updated: Date.now() }, ...d.pages],
      activeId: id,
    }));
  };

  const deletePage = (id) => {
    if (!window.confirm('Remove this page?')) return;
    setData(d => {
      const remaining = d.pages.filter(p => p.id !== id);
      if (remaining.length === 0) {
        const fid = Date.now();
        return { pages: [{ id: fid, title: 'untitled', html: '', updated: Date.now() }], activeId: fid };
      }
      return { pages: remaining, activeId: remaining[0].id };
    });
  };

  // execCommand wrapper. Re-focus the editor first so the command targets it.
  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    // Capture the resulting HTML
    if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
  };

  // Toolbar button helper
  const TBtn = ({ onClick, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      onMouseDown={e => e.preventDefault() /* keep editor focused */}
      style={{
        height: 34, minWidth: 34, padding: '0 10px',
        borderRadius: 8,
        background: 'transparent',
        color: '#2B1F17',
        fontSize: 13, fontWeight: 500,
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(43,31,23,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  );

  const fmtDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    return sameDay
      ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fade-up" style={{ paddingTop: 100, minHeight: '100vh' }}>
      <PanelHeader panel={panel} onNav={onNav} subtitle="A page that listens. Write in fragments, lists, or long letters to no one." />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 20,
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
          minHeight: 600,
        }}>

          {/* Sidebar: list of pages */}
          <div style={{
            borderRight: '1px solid rgba(43,31,23,0.08)',
            background: 'rgba(255,122,69,0.03)',
            display: 'flex', flexDirection: 'column',
          }}>
            <button
              onClick={newPage}
              className="mono"
              style={{
                margin: 14,
                padding: '10px 14px',
                background: panel.hue,
                color: '#FFFDFA',
                borderRadius: 10,
                textAlign: 'left',
              }}
            >
              + New page
            </button>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {data.pages.map(p => {
                const isActive = p.id === data.activeId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setData(d => ({ ...d, activeId: p.id }))}
                    style={{
                      padding: '12px 16px',
                      borderLeft: `3px solid ${isActive ? panel.hue : 'transparent'}`,
                      background: isActive ? 'rgba(255,122,69,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(43,31,23,0.03)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{
                      fontSize: 14, fontWeight: 500, color: '#2B1F17',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      paddingRight: 24,
                    }}>
                      {p.title || 'untitled'}
                    </div>
                    <div className="mono" style={{ color: '#8A7668', fontSize: 10, marginTop: 4 }}>
                      {fmtDate(p.updated)}
                    </div>
                    {isActive && data.pages.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePage(p.id); }}
                        title="Delete page"
                        style={{
                          position: 'absolute', top: 10, right: 10,
                          width: 22, height: 22, borderRadius: 6,
                          color: '#8A7668',
                          fontSize: 14, lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Title */}
            <input
              value={activePage.title}
              onChange={e => updateActive({ title: e.target.value })}
              placeholder="untitled"
              className="display"
              style={{
                border: 'none', outline: 'none',
                fontSize: 32, fontWeight: 400, fontStyle: 'italic',
                letterSpacing: '-0.02em',
                color: '#2B1F17',
                padding: '24px 28px 8px',
                background: 'transparent',
                fontFamily: 'Fraunces, serif',
              }}
            />

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 22px',
              borderBottom: '1px solid rgba(43,31,23,0.08)',
              flexWrap: 'wrap',
            }}>
              <select
                onChange={e => exec('formatBlock', e.target.value)}
                defaultValue=""
                style={{
                  height: 34, padding: '0 8px',
                  background: 'transparent',
                  border: '1px solid rgba(43,31,23,0.1)',
                  borderRadius: 8,
                  fontSize: 13, fontFamily: 'inherit',
                  color: '#2B1F17',
                }}
                title="Heading style"
              >
                <option value="" disabled>Style</option>
                <option value="P">Body</option>
                <option value="H2">Heading</option>
                <option value="H3">Subheading</option>
              </select>

              <select
                onChange={e => {
                  // Wrap the selection in a span with the chosen size.
                  // We do this manually for finer control than execCommand fontSize gives.
                  const px = e.target.value;
                  if (!px) return;
                  editorRef.current?.focus();
                  document.execCommand('fontSize', false, '7');
                  // Replace any size-7 fonts execCommand inserted with our chosen size
                  const fonts = editorRef.current.querySelectorAll('font[size="7"]');
                  fonts.forEach(f => {
                    const span = document.createElement('span');
                    span.style.fontSize = px + 'px';
                    span.innerHTML = f.innerHTML;
                    f.replaceWith(span);
                  });
                  if (editorRef.current) updateActive({ html: editorRef.current.innerHTML });
                  e.target.value = '';
                }}
                defaultValue=""
                style={{
                  height: 34, padding: '0 8px',
                  background: 'transparent',
                  border: '1px solid rgba(43,31,23,0.1)',
                  borderRadius: 8,
                  fontSize: 13, fontFamily: 'inherit',
                  color: '#2B1F17',
                }}
                title="Font size"
              >
                <option value="" disabled>Size</option>
                <option value="13">Small</option>
                <option value="16">Normal</option>
                <option value="20">Large</option>
                <option value="26">XL</option>
              </select>

              <span style={{ width: 1, height: 22, background: 'rgba(43,31,23,0.1)', margin: '0 6px' }}/>

              <TBtn onClick={() => exec('bold')} title="Bold"><b>B</b></TBtn>
              <TBtn onClick={() => exec('italic')} title="Italic"><i>I</i></TBtn>
              <TBtn onClick={() => exec('underline')} title="Underline"><u>U</u></TBtn>

              <span style={{ width: 1, height: 22, background: 'rgba(43,31,23,0.1)', margin: '0 6px' }}/>

              <TBtn onClick={() => exec('insertUnorderedList')} title="Bullet list">• List</TBtn>
              <TBtn onClick={() => exec('insertOrderedList')} title="Numbered list">1. List</TBtn>

              <span style={{ width: 1, height: 22, background: 'rgba(43,31,23,0.1)', margin: '0 6px' }}/>

              <TBtn onClick={() => exec('removeFormat')} title="Clear formatting">Clear</TBtn>
            </div>

            {/* The editable area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={e => updateActive({ html: e.currentTarget.innerHTML })}
              data-placeholder="start writing…"
              style={{
                flex: 1, minHeight: 420,
                padding: '24px 28px 32px',
                fontSize: 16, lineHeight: 1.65,
                color: '#2B1F17',
                outline: 'none',
                fontFamily: 'Inter Tight, sans-serif',
              }}
            />
          </div>
        </div>
      </div>

      {/* Inline styles for editor headings + placeholder */}
      <style>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #8A7668;
          font-style: italic;
        }
        [contenteditable] h2 {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: -0.02em;
          margin: 18px 0 8px;
          color: #2B1F17;
        }
        [contenteditable] h3 {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: 22px;
          font-weight: 400;
          margin: 14px 0 6px;
          color: #2B1F17;
        }
        [contenteditable] p { margin: 8px 0; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 8px 0; }
        [contenteditable] li { margin: 4px 0; }
      `}</style>
    </div>
  );
};

// ---------- Workout Page ----------
// Cardio-only logger: each session = { date, calories, miles, minutes }.
// Below the form we render a hand-rolled SVG line/area chart of calories
// over time. No chart library — keeps the bundle tiny and matches the
// site's illustrated aesthetic.
const WorkoutPage = ({ panel, onNav }) => {
  const [sessions, setSessions] = useState(() =>
    loadJSON(STORAGE.workout, []).sort((a, b) => a.date.localeCompare(b.date))
  );
  const today = new Date().toISOString().slice(0, 10);
  const [draft, setDraft] = useState({
    date: today, calories: '', miles: '', minutes: '',
  });
  const [metric, setMetric] = useState('calories'); // which series to chart

  useEffect(() => { saveJSON(STORAGE.workout, sessions); }, [sessions]);

  const addSession = () => {
    const cal = parseFloat(draft.calories);
    const mi = parseFloat(draft.miles);
    const min = parseFloat(draft.minutes);
    if (isNaN(cal) || isNaN(mi) || isNaN(min)) return;
    if (cal < 0 || mi < 0 || min < 0) return;
    const next = [...sessions, {
      id: Date.now() + Math.random(),
      date: draft.date,
      calories: cal,
      miles: mi,
      minutes: min,
    }].sort((a, b) => a.date.localeCompare(b.date));
    setSessions(next);
    setDraft({ date: today, calories: '', miles: '', minutes: '' });
  };

  const removeSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Stats
  const totals = sessions.reduce((acc, s) => ({
    calories: acc.calories + s.calories,
    miles: acc.miles + s.miles,
    minutes: acc.minutes + s.minutes,
  }), { calories: 0, miles: 0, minutes: 0 });

  // ---------- Chart ----------
  // We plot one metric across all sessions in order. If everything is on
  // the same date, we still show them in entry order.
  const W = 880, H = 280, padL = 50, padR = 20, padT = 30, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values = sessions.map(s => s[metric]);
  const maxVal = Math.max(10, ...values); // avoid /0
  const minVal = 0;

  const xAt = (i) => sessions.length <= 1
    ? padL + innerW / 2
    : padL + (i / (sessions.length - 1)) * innerW;
  const yAt = (v) => padT + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  // y-axis ticks
  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => (maxVal / ticks) * i);

  // Build the line + area paths
  let linePath = '';
  let areaPath = '';
  if (sessions.length > 0) {
    sessions.forEach((s, i) => {
      const x = xAt(i), y = yAt(s[metric]);
      linePath += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    });
    if (sessions.length === 1) {
      // Render a small horizontal segment so there's something visible
      const x = xAt(0), y = yAt(sessions[0][metric]);
      linePath = `M ${x - 20} ${y} L ${x + 20} ${y}`;
      areaPath = `M ${x - 20} ${y} L ${x + 20} ${y} L ${x + 20} ${padT + innerH} L ${x - 20} ${padT + innerH} Z`;
    } else {
      const lastX = xAt(sessions.length - 1);
      const firstX = xAt(0);
      areaPath = linePath + ` L ${lastX} ${padT + innerH} L ${firstX} ${padT + innerH} Z`;
    }
  }

  const metricLabels = { calories: 'calories burned', miles: 'miles', minutes: 'minutes' };

  return (
    <div className="fade-up" style={{ paddingTop: 100, minHeight: '100vh' }}>
      <PanelHeader panel={panel} onNav={onNav} subtitle="Small motions, stacked. A gentle record of what your body did today." />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 80px' }}>

        {/* Add-session row */}
        <div style={{
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 28,
          display: 'grid',
          gridTemplateColumns: '140px 1fr 1fr 1fr auto',
          gap: 12,
          alignItems: 'end',
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
        }}>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Date</label>
            <input
              type="date"
              value={draft.date}
              onChange={e => setDraft({ ...draft, date: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Calories</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={draft.calories}
              onChange={e => setDraft({ ...draft, calories: e.target.value })}
              placeholder="e.g. 320"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Miles</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={draft.miles}
              onChange={e => setDraft({ ...draft, miles: e.target.value })}
              placeholder="e.g. 2.4"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Minutes</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={draft.minutes}
              onChange={e => setDraft({ ...draft, minutes: e.target.value })}
              placeholder="e.g. 28"
              style={inputStyle}
            />
          </div>
          <button
            onClick={addSession}
            className="mono"
            style={{
              padding: '12px 20px',
              borderRadius: 999,
              background: panel.hue,
              color: '#FFFDFA',
              height: 44,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px -8px ${panel.hue}88`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Log +
          </button>
        </div>

        {/* Totals strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}>
          {[
            { k: 'Total calories', v: Math.round(totals.calories).toLocaleString() },
            { k: 'Total miles', v: totals.miles.toFixed(1) },
            { k: 'Total minutes', v: Math.round(totals.minutes).toLocaleString() },
          ].map(item => (
            <div key={item.k} style={{
              background: '#FFFDFA',
              border: '1px solid rgba(43,31,23,0.08)',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
            }}>
              <div className="mono" style={{ color: '#8A7668' }}>{item.k}</div>
              <div className="display" style={{
                fontSize: 38, fontStyle: 'italic', fontWeight: 300,
                letterSpacing: '-0.02em', color: '#2B1F17', marginTop: 6,
              }}>
                {item.v}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 20,
          padding: '24px 24px 16px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="mono" style={{ color: panel.hue }}>— Trend</span>
              <div className="display" style={{
                fontSize: 24, fontStyle: 'italic', fontWeight: 300,
                color: '#2B1F17', marginTop: 4,
              }}>
                {metricLabels[metric]} over time
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, background: '#F6F1EA', padding: 4, borderRadius: 10 }}>
              {['calories', 'miles', 'minutes'].map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className="mono"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: metric === m ? '#FFFDFA' : 'transparent',
                    color: metric === m ? '#2B1F17' : '#8A7668',
                    boxShadow: metric === m ? '0 1px 3px rgba(43,31,23,0.08)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {sessions.length === 0 ? (
            <div style={{
              height: 240,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8A7668', fontStyle: 'italic',
            }}>
              log a session above to see the curve.
            </div>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="wo-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={panel.hue} stopOpacity="0.35"/>
                  <stop offset="100%" stopColor={panel.hue} stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Y-axis grid + labels */}
              {tickValues.map((t, i) => {
                const y = yAt(t);
                return (
                  <g key={i}>
                    <line x1={padL} y1={y} x2={W - padR} y2={y}
                          stroke="#2B1F17" strokeOpacity="0.06" strokeDasharray="3 4"/>
                    <text x={padL - 8} y={y + 4} textAnchor="end"
                          fontFamily="Inter Tight" fontSize="10" fill="#8A7668">
                      {Math.round(t)}
                    </text>
                  </g>
                );
              })}

              {/* X-axis baseline */}
              <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH}
                    stroke="#2B1F17" strokeOpacity="0.2"/>

              {/* Area + line */}
              <path d={areaPath} fill="url(#wo-area)"/>
              <path d={linePath} fill="none" stroke={panel.hue} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>

              {/* Points + x-axis date labels */}
              {sessions.map((s, i) => {
                const x = xAt(i), y = yAt(s[metric]);
                // Show date label sparsely so they don't collide
                const showLabel = sessions.length <= 8 ||
                  i === 0 || i === sessions.length - 1 ||
                  i % Math.ceil(sessions.length / 6) === 0;
                const dateLabel = new Date(s.date + 'T00:00').toLocaleDateString([], { month: 'short', day: 'numeric' });
                return (
                  <g key={s.id}>
                    <circle cx={x} cy={y} r="4" fill="#FFFDFA" stroke={panel.hue} strokeWidth="2"/>
                    {showLabel && (
                      <text x={x} y={padT + innerH + 18} textAnchor="middle"
                            fontFamily="Inter Tight" fontSize="10" fill="#8A7668">
                        {dateLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Session list */}
        {sessions.length > 0 && (
          <div style={{
            background: '#FFFDFA',
            border: '1px solid rgba(43,31,23,0.08)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 50px',
              padding: '14px 22px',
              borderBottom: '1px solid rgba(43,31,23,0.08)',
              background: 'rgba(255,122,69,0.04)',
            }}>
              {['Date', 'Calories', 'Miles', 'Minutes', ''].map(h => (
                <div key={h} className="mono" style={{ color: '#8A7668' }}>{h}</div>
              ))}
            </div>
            {[...sessions].reverse().map(s => (
              <div key={s.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 50px',
                padding: '14px 22px',
                borderBottom: '1px solid rgba(43,31,23,0.04)',
                alignItems: 'center',
                fontSize: 14,
                color: '#2B1F17',
              }}>
                <div>{new Date(s.date + 'T00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div>{Math.round(s.calories)}</div>
                <div>{s.miles.toFixed(1)}</div>
                <div>{Math.round(s.minutes)}</div>
                <button
                  onClick={() => removeSession(s.id)}
                  title="Remove"
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    color: '#8A7668', fontSize: 16,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,74,32,0.08)'; e.currentTarget.style.color = '#D94A20'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A7668'; }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Feature Sub-page ----------
const FeaturePage = ({ panelId, onNav }) => {
  const panel = PANELS.find(p => p.id === panelId);
  const idx = PANELS.findIndex(p => p.id === panelId);
  const next = PANELS[(idx + 1) % PANELS.length];
  if (!panel) return null;

  return (
    <div className="fade-up" style={{ paddingTop: 100, minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 40px' }}>
        <span className="mono" style={{ color: '#8A7668' }}>
          Index → <span style={{ color: panel.hue }}>{panel.label}</span>
        </span>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span className="mono" style={{ color: panel.hue }}>{panel.number} · Feature</span>
            <h1 className="display" style={{
              fontSize: 'clamp(72px, 10vw, 160px)',
              fontWeight: 300, fontStyle: 'italic',
              lineHeight: 0.9, letterSpacing: '-0.04em',
              color: '#2B1F17', marginTop: 20,
            }}>
              {panel.label}.
            </h1>
            <p style={{ fontSize: 22, lineHeight: 1.45, color: '#5C4A3E', marginTop: 28, maxWidth: 480 }}>
              {panel.description}
            </p>
            <div style={{ marginTop: 36, display: 'flex', gap: 12 }}>
              <button style={{
                padding: '14px 22px', borderRadius: 999,
                background: panel.hue, color: '#FFFDFA',
                fontSize: 14, fontWeight: 500,
              }}>
                Get early access →
              </button>
              <button onClick={() => onNav('home')} style={{
                padding: '14px 22px', borderRadius: 999,
                border: '1px solid rgba(43,31,23,0.2)',
                fontSize: 14, fontWeight: 500,
              }}>
                ← All features
              </button>
            </div>
          </div>

          {/* Large illustration panel */}
          <div style={{
            aspectRatio: '4 / 5',
            borderRadius: 32,
            background: `linear-gradient(160deg, #FFFDFA, ${panel.hue}18)`,
            border: '1px solid rgba(43,31,23,0.08)',
            padding: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: `0 40px 80px -40px ${panel.hue}55`,
          }}>
            <div style={{ transform: 'scale(1.8)' }}>
              <PanelIllustration id={panel.id} hue={panel.hue}/>
            </div>
            <span className="mono" style={{ position: 'absolute', top: 24, left: 24, color: panel.hue }}>
              {panel.number}
            </span>
            <span className="mono" style={{ position: 'absolute', bottom: 24, right: 24, color: '#8A7668' }}>
              Preview
            </span>
          </div>
        </div>
      </div>

      {/* Detail stripe */}
      <div style={{
        background: '#FFFDFA',
        borderTop: '1px solid rgba(43,31,23,0.08)',
        borderBottom: '1px solid rgba(43,31,23,0.08)',
        padding: '80px 40px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {[
            { k: 'Principle', v: 'Less, but thoughtful', t: 'No notifications, no streaks shaming you. Just the tool, when you want it.' },
            { k: 'Privacy', v: 'Yours, locally', t: 'Everything stays on device by default. Export anytime, delete in one tap.' },
            { k: 'Design', v: 'Calm by default', t: 'Warm light mode, true dark mode, and a serif-forward reading experience.' },
          ].map((item, i) => (
            <div key={i}>
              <span className="mono" style={{ color: panel.hue }}>— {item.k}</span>
              <div className="display" style={{ fontSize: 32, fontStyle: 'italic', fontWeight: 300, color: '#2B1F17', margin: '12px 0 16px', lineHeight: 1.1 }}>
                {item.v}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: '#5C4A3E' }}>{item.t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next feature */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
        <button onClick={() => onNav(next.id)} style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '40px',
          borderRadius: 24,
          background: `linear-gradient(100deg, #FFFDFA, ${next.hue}18)`,
          border: '1px solid rgba(43,31,23,0.08)',
          transition: 'transform 0.4s, box-shadow 0.4s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 30px 60px -30px ${next.hue}55`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="mono" style={{ color: '#8A7668' }}>Next room · {next.number}</span>
              <div className="display" style={{ fontSize: 64, fontStyle: 'italic', fontWeight: 300, color: '#2B1F17', marginTop: 8 }}>
                {next.label} →
              </div>
              <p style={{ color: '#5C4A3E', marginTop: 8, fontStyle: 'italic' }}>{next.tagline}</p>
            </div>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: next.hue,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 12 12" fill="none">
                <path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="#FFFDFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

// ---------- Login / Sign Up Page ----------
const LoginPage = ({ onNav }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [focus, setFocus] = useState(null);
  const [showPw, setShowPw] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hook up to real auth later
    alert(`${isSignup ? 'Sign up' : 'Log in'} submitted for ${form.email}`);
  };

  const input = (name, type, placeholder, label) => {
    const isFocused = focus === name;
    const hasVal = form[name].length > 0;
    return (
      <div style={{ position: 'relative' }}>
        <label style={{
          position: 'absolute',
          left: 18,
          top: (isFocused || hasVal) ? 8 : 18,
          fontSize: (isFocused || hasVal) ? 10 : 14,
          letterSpacing: (isFocused || hasVal) ? '0.08em' : '0',
          textTransform: (isFocused || hasVal) ? 'uppercase' : 'none',
          color: isFocused ? '#D94A20' : '#8A7668',
          pointerEvents: 'none',
          transition: 'all 0.25s cubic-bezier(0.2,0.8,0.2,1)',
          fontWeight: 500,
        }}>
          {label}
        </label>
        <input
          type={name === 'password' && showPw ? 'text' : type}
          value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          onFocus={() => setFocus(name)}
          onBlur={() => setFocus(null)}
          style={{
            width: '100%',
            padding: '26px 18px 10px',
            background: '#FFFDFA',
            border: `1px solid ${isFocused ? '#D94A20' : 'rgba(43,31,23,0.12)'}`,
            borderRadius: 14,
            fontSize: 15,
            fontFamily: 'inherit',
            color: '#2B1F17',
            outline: 'none',
            transition: 'all 0.25s',
            boxShadow: isFocused ? '0 0 0 4px rgba(217,74,32,0.08)' : 'none',
          }}
        />
        {name === 'password' && (
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#8A7668', fontWeight: 500,
            }}
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fade-up" style={{
      minHeight: '100vh',
      paddingTop: 100,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Left: form column */}
      <div style={{
        padding: '40px 60px 60px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        maxWidth: 560, margin: '0 auto', width: '100%',
      }}>
        <span className="mono" style={{ color: '#D94A20' }}>
          — {isSignup ? '02 · New here' : '01 · Welcome back'}
        </span>
        <h1 className="display" style={{
          fontSize: 'clamp(52px, 6vw, 88px)',
          fontWeight: 300, fontStyle: 'italic',
          lineHeight: 0.95, letterSpacing: '-0.03em',
          color: '#2B1F17', marginTop: 16, marginBottom: 12,
        }}>
          {isSignup ? (
            <>Make a <br/>nook of <br/>your own.</>
          ) : (
            <>Step back <br/>into your <br/>nook.</>
          )}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: '#5C4A3E', marginBottom: 36, maxWidth: 400 }}>
          {isSignup
            ? 'Your planner, journal, and everything in between — waiting quietly for you to return.'
            : 'Your days, rituals, and reflections are right where you left them.'}
        </p>

        {/* Social auth */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => alert('Google auth would run here')}
            style={{
              padding: '16px 18px',
              background: '#FFFDFA',
              border: '1px solid rgba(43,31,23,0.12)',
              borderRadius: 14,
              fontSize: 15, fontWeight: 500,
              color: '#2B1F17',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2B1F17'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(43,31,23,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => alert('Apple auth would run here')}
            style={{
              padding: '16px 18px',
              background: '#2B1F17',
              border: '1px solid #2B1F17',
              borderRadius: 14,
              fontSize: 15, fontWeight: 500,
              color: '#F6F1EA',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#F6F1EA">
              <path d="M14.94 9.56c-.02-2.06 1.68-3.05 1.76-3.1-.96-1.4-2.46-1.6-2.99-1.62-1.27-.13-2.48.75-3.13.75-.65 0-1.65-.73-2.71-.71-1.39.02-2.68.81-3.4 2.06-1.45 2.52-.37 6.25 1.04 8.3.69 1 1.51 2.12 2.58 2.08 1.04-.04 1.43-.67 2.68-.67s1.6.67 2.7.65c1.12-.02 1.82-1.01 2.5-2.02.79-1.16 1.11-2.29 1.13-2.35-.02-.01-2.17-.83-2.19-3.31zM12.9 3.5c.57-.69.96-1.66.85-2.61-.83.03-1.83.55-2.42 1.24-.53.61-.99 1.59-.87 2.53.93.07 1.87-.47 2.44-1.16z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          margin: '28px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(43,31,23,0.12)' }}/>
          <span className="mono" style={{ color: '#8A7668' }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(43,31,23,0.12)' }}/>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isSignup && input('name', 'text', 'Your name', 'Name')}
          {input('email', 'email', 'you@example.com', 'Email')}
          {input('password', 'password', '••••••••', 'Password')}

          {!isSignup && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
              <button type="button" style={{ fontSize: 13, color: '#5C4A3E', fontStyle: 'italic' }}>
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: '16px 22px',
              background: '#D94A20',
              color: '#FFFDFA',
              borderRadius: 14,
              fontSize: 15, fontWeight: 500,
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2B1F17'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#D94A20'; }}
          >
            {isSignup ? 'Create your account' : 'Enter NookEase'}
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="#FFFDFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        {/* Mode toggle */}
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: '#5C4A3E' }}>
          {isSignup ? 'Already have a nook?' : 'New to NookEase?'}
          {' '}
          <button
            onClick={() => setMode(isSignup ? 'login' : 'signup')}
            style={{
              color: '#D94A20', fontWeight: 500,
              borderBottom: '1px solid #D94A20',
              paddingBottom: 1,
            }}
          >
            {isSignup ? 'Log in' : 'Create an account'}
          </button>
        </div>

        {isSignup && (
          <p style={{ marginTop: 20, fontSize: 12, color: '#8A7668', textAlign: 'center', lineHeight: 1.5, maxWidth: 360, margin: '20px auto 0' }}>
            By signing up, you agree to our <u>Terms</u> and <u>Privacy Policy</u>.
            Your data stays encrypted and yours.
          </p>
        )}
      </div>

      {/* Right: ambient panel */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #FFFDFA 0%, #FFE9DC 40%, #FFB89A 100%)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
      }}>
        {/* Soft orbs */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,122,69,0.4), transparent 70%)',
          top: '-100px', right: '-100px', filter: 'blur(20px)',
        }}/>
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,74,32,0.25), transparent 70%)',
          bottom: '-80px', left: '-80px', filter: 'blur(20px)',
        }}/>

        {/* Quote card */}
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 440,
          padding: 44,
          background: 'rgba(255,253,250,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,253,250,0.8)',
          borderRadius: 28,
          boxShadow: '0 40px 80px -30px rgba(43,31,23,0.25)',
        }}>
          <span className="mono" style={{ color: '#D94A20' }}>A moment of stillness</span>
          <div className="display" style={{
            fontSize: 36,
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#2B1F17',
            marginTop: 18,
          }}>
            "The small rooms of a day deserve gentle keeping."
          </div>
          <div style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid rgba(43,31,23,0.15)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div className="mono" style={{ color: '#8A7668' }}>Today's rituals</div>
              <div style={{ fontSize: 15, color: '#2B1F17', marginTop: 4, fontStyle: 'italic' }}>
                Journal · Walk · Tea
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2,3].map(i => (
                <span key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < 3 ? '#D94A20' : 'rgba(43,31,23,0.15)',
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Corner marks */}
        <span className="mono" style={{ position: 'absolute', top: 32, left: 32, color: '#8A7668' }}>
          NookEase · Sign in
        </span>
        <span className="mono" style={{ position: 'absolute', bottom: 32, right: 32, color: '#8A7668' }}>
          © 2026
        </span>
      </div>
    </div>
  );
};

// ---------- Guide (scripted navigation companion) ----------
const CompanionLogo = ({ size = 28, animated = false }) => (
  // Original flame-wrapping-orb mark for NookEase's guide "Ember"
  // Warm flame swirl in NookEase oranges, with a soft cream orb center
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display: 'block' }}>
    <defs>
      <radialGradient id="ember-flame" cx="0.3" cy="0.3" r="0.9">
        <stop offset="0%" stopColor="#FFB089"/>
        <stop offset="45%" stopColor="#FF7A45"/>
        <stop offset="100%" stopColor="#C94116"/>
      </radialGradient>
      <radialGradient id="ember-orb" cx="0.35" cy="0.35" r="0.8">
        <stop offset="0%" stopColor="#FFFDFA"/>
        <stop offset="60%" stopColor="#FFE9DC"/>
        <stop offset="100%" stopColor="#FFB089"/>
      </radialGradient>
      <radialGradient id="ember-inner" cx="0.4" cy="0.4" r="0.7">
        <stop offset="0%" stopColor="#FFFDFA"/>
        <stop offset="100%" stopColor="#FF7A45" stopOpacity="0"/>
      </radialGradient>
    </defs>

    <path
      d="M 32 58
         C 14 58, 6 46, 6 32
         C 6 18, 16 6, 32 6
         C 44 6, 52 12, 55 20
         C 52 14, 44 12, 38 14
         C 48 16, 54 24, 54 32
         C 54 44, 44 52, 32 52
         C 22 52, 14 46, 14 36
         C 14 28, 20 22, 28 22
         C 22 24, 18 30, 20 36
         C 22 42, 28 46, 34 46
         C 42 46, 48 40, 48 32
         C 48 26, 44 22, 40 22
         C 46 18, 56 18, 60 28
         C 58 16, 50 2, 34 4
         C 40 8, 44 14, 44 18
         C 40 10, 30 8, 24 12
         Z"
      fill="url(#ember-flame)"
    />
    <circle cx="32" cy="34" r="11" fill="url(#ember-orb)"/>
    <circle cx="29" cy="31" r="5" fill="url(#ember-inner)" opacity="0.9"/>

    {animated && (
      <circle cx="32" cy="34" r="11" fill="none" stroke="#FFFDFA" strokeWidth="0.5" opacity="0.6">
        <animate attributeName="r" values="11;14;11" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite"/>
      </circle>
    )}
  </svg>
);

// --- Scripted menu system ---
// Each "screen" is a state of the guide. The user navigates by tapping options.
// Free-text input is matched against keywords and falls back to the main menu if unrecognized.

const GUIDE_SCREENS = {
  main: {
    message: "Hi, I'm Ember — your guide to NookEase. What would you like help with?",
    options: [
      { label: 'Explore the features', next: 'features' },
      { label: 'About NookEase', next: 'about' },
      { label: 'Sign up or log in', next: 'account' },
      { label: 'Privacy & your data', next: 'privacy' },
    ],
  },
  features: {
    message: "We have seven quiet rooms. Which would you like to visit?",
    options: [
      ...PANELS.map(p => ({
        label: `${p.label} — ${p.tagline.toLowerCase()}`,
        navigate: p.id,
        next: 'navigated',
      })),
      { label: '← Back to main menu', next: 'main' },
    ],
  },
  about: {
    message: "NookEase is a gentle companion for daily rituals — planning, moving, writing, resting. One unhurried app, seven quiet rooms. We're in private beta right now.",
    options: [
      { label: 'See the features', next: 'features' },
      { label: 'How does pricing work?', next: 'pricing' },
      { label: 'Who is this for?', next: 'audience' },
      { label: '← Back to main menu', next: 'main' },
    ],
  },
  audience: {
    message: "NookEase is for anyone who wants software that feels like a deep breath. Writers, planners, quiet achievers, and anyone tired of apps that shout.",
    options: [
      { label: 'See the features', next: 'features' },
      { label: 'Sign up for beta', navigate: 'login', next: 'navigated' },
      { label: '← Back to main menu', next: 'main' },
    ],
  },
  pricing: {
    message: "NookEase is free during our private beta. Pricing details will arrive when we open more broadly — beta members will get early-access perks.",
    options: [
      { label: 'Join the beta', navigate: 'login', next: 'navigated' },
      { label: '← Back to main menu', next: 'main' },
    ],
  },
  account: {
    message: "You can create a new account or sign back into an existing one. Google and Apple sign-in are the fastest way in.",
    options: [
      { label: 'Go to sign-up / log in', navigate: 'login', next: 'navigated' },
      { label: 'Privacy & your data', next: 'privacy' },
      { label: '← Back to main menu', next: 'main' },
    ],
  },
  privacy: {
    message: "Your data stays on your device by default — encrypted and yours. You can export everything anytime, or delete it all in one tap. We never sell data.",
    options: [
      { label: 'Sign up', navigate: 'login', next: 'navigated' },
      { label: 'Learn about the features', next: 'features' },
      { label: '← Back to main menu', next: 'main' },
    ],
  },
  navigated: {
    message: "Here you go — I've opened that for you. Is there anything else?",
    options: [
      { label: 'Explore other features', next: 'features' },
      { label: '← Main menu', next: 'main' },
    ],
  },
  unknown: {
    message: "I didn't quite catch that. I can help you navigate to features, answer questions about the app, or take you to sign-up. Try one of these:",
    options: [
      { label: 'Explore features', next: 'features' },
      { label: 'About NookEase', next: 'about' },
      { label: 'Sign up or log in', next: 'account' },
      { label: '← Main menu', next: 'main' },
    ],
  },
};

// Keyword matching for free-text input
const matchKeywords = (text) => {
  const t = text.toLowerCase().trim();

  // Feature shortcuts
  for (const p of PANELS) {
    if (t.includes(p.id) || t.includes(p.label.toLowerCase())) {
      return { navigate: p.id, screen: 'navigated' };
    }
  }

  // Intent shortcuts
  if (/\b(sign ?up|signup|create|register|new account)\b/.test(t))
    return { navigate: 'login', screen: 'navigated' };
  if (/\b(log ?in|login|sign ?in|signin)\b/.test(t))
    return { navigate: 'login', screen: 'navigated' };
  if (/\b(home|index|back|start)\b/.test(t))
    return { navigate: 'home', screen: 'navigated' };

  // Topic shortcuts
  if (/\b(feature|room|what.*(have|offer|do))\b/.test(t)) return { screen: 'features' };
  if (/\b(about|what.*nookease|tell me)\b/.test(t)) return { screen: 'about' };
  if (/\b(price|pricing|cost|free|pay|money)\b/.test(t)) return { screen: 'pricing' };
  if (/\b(privacy|data|safe|secure|encrypt)\b/.test(t)) return { screen: 'privacy' };
  if (/\b(who.*for|audience|user)\b/.test(t)) return { screen: 'audience' };
  if (/\b(hi|hello|hey|yo)\b/.test(t)) return { screen: 'main' };

  return { screen: 'unknown' };
};

const Companion = ({ currentRoute, onNav }) => {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState('main');
  const [history, setHistory] = useState([
    { from: 'ember', text: GUIDE_SCREENS.main.message },
  ]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, open]);

  const goToScreen = (key, userLabel = null) => {
    const newEntries = [];
    if (userLabel) newEntries.push({ from: 'user', text: userLabel });
    const target = GUIDE_SCREENS[key] || GUIDE_SCREENS.main;
    newEntries.push({ from: 'ember', text: target.message });
    setHistory(h => [...h, ...newEntries]);
    setScreen(key);
  };

  const handleOption = (opt) => {
    if (opt.navigate) {
      setTimeout(() => onNav(opt.navigate), 500);
    }
    goToScreen(opt.next, opt.label);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setHistory(h => [...h, { from: 'user', text }]);
    setDraft('');

    setTimeout(() => {
      const match = matchKeywords(text);
      if (match.navigate) {
        setTimeout(() => onNav(match.navigate), 500);
      }
      const target = GUIDE_SCREENS[match.screen];
      setHistory(h => [...h, { from: 'ember', text: target.message }]);
      setScreen(match.screen);
    }, 400);
  };

  const currentOptions = GUIDE_SCREENS[screen]?.options || [];

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open Ember, your NookEase guide"
        style={{
          position: 'fixed',
          bottom: 28, right: 28,
          zIndex: 60,
          width: 62, height: 62,
          borderRadius: '50%',
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          boxShadow: open
            ? '0 8px 20px -8px rgba(217,74,32,0.3)'
            : '0 14px 36px -10px rgba(217,74,32,0.45), 0 4px 10px rgba(43,31,23,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.4s cubic-bezier(0.2,0.8,0.2,1)',
          transform: open ? 'scale(0.92) rotate(90deg)' : 'scale(1) rotate(0)',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.06) rotate(-8deg)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.transform = 'scale(1) rotate(0)'; }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5 L15 15 M15 5 L5 15" stroke="#2B1F17" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        ) : (
          <CompanionLogo size={36} animated/>
        )}
        {!open && (
          <span style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: '1.5px solid #FF7A45',
            opacity: 0,
            animation: 'companion-pulse 2.8s ease-out infinite',
            pointerEvents: 'none',
          }}/>
        )}
      </button>

      {/* Guide window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 104, right: 28,
          zIndex: 59,
          width: 380, maxWidth: 'calc(100vw - 56px)',
          height: 560, maxHeight: 'calc(100vh - 140px)',
          background: '#F6F1EA',
          border: '1px solid rgba(43,31,23,0.1)',
          borderRadius: 22,
          boxShadow: '0 40px 80px -20px rgba(43,31,23,0.25), 0 16px 32px -12px rgba(43,31,23,0.12)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '18px 20px',
            background: 'linear-gradient(135deg, #FFFDFA 0%, #FFE9DC 100%)',
            borderBottom: '1px solid rgba(43,31,23,0.08)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: '#FFFDFA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px -2px rgba(217,74,32,0.3)',
            }}>
              <CompanionLogo size={26}/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="display" style={{
                fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em',
                color: '#2B1F17',
              }}>
                Ember
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#4A9D5F',
                }}/>
                <span className="mono" style={{ color: '#8A7668', fontSize: 10 }}>
                  Your NookEase guide
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setHistory([{ from: 'ember', text: GUIDE_SCREENS.main.message }]);
                setScreen('main');
              }}
              className="mono"
              style={{ color: '#8A7668', fontSize: 10 }}
              title="Start over"
            >
              Reset
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {history.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
                animation: 'msg-in 0.4s cubic-bezier(0.2,0.8,0.2,1) both',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '11px 15px',
                  borderRadius: m.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.from === 'user' ? '#2B1F17' : '#FFFDFA',
                  color: m.from === 'user' ? '#F6F1EA' : '#2B1F17',
                  border: m.from === 'user' ? 'none' : '1px solid rgba(43,31,23,0.08)',
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: m.from === 'ember' ? '0 2px 6px rgba(43,31,23,0.04)' : 'none',
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Inline option buttons — these are the primary interaction */}
            {currentOptions.length > 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 6,
                marginTop: 4,
              }}>
                {currentOptions.map((opt, i) => {
                  const isBack = opt.label.startsWith('←');
                  return (
                    <button
                      key={i}
                      onClick={() => handleOption(opt)}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        background: isBack ? 'transparent' : '#FFFDFA',
                        border: `1px solid ${isBack ? 'rgba(43,31,23,0.12)' : 'rgba(217,74,32,0.25)'}`,
                        borderRadius: 12,
                        fontSize: 13,
                        color: isBack ? '#8A7668' : '#2B1F17',
                        fontWeight: 500,
                        transition: 'all 0.25s',
                        animation: `msg-in 0.4s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.04}s both`,
                      }}
                      onMouseEnter={e => {
                        if (!isBack) {
                          e.currentTarget.style.background = '#D94A20';
                          e.currentTarget.style.color = '#FFFDFA';
                          e.currentTarget.style.borderColor = '#D94A20';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        } else {
                          e.currentTarget.style.background = 'rgba(43,31,23,0.04)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isBack) {
                          e.currentTarget.style.background = '#FFFDFA';
                          e.currentTarget.style.color = '#2B1F17';
                          e.currentTarget.style.borderColor = 'rgba(217,74,32,0.25)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        } else {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input (free-text fallback) */}
          <div style={{
            padding: 14,
            borderTop: '1px solid rgba(43,31,23,0.08)',
            background: '#FFFDFA',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Or type your question…"
              style={{
                flex: 1,
                padding: '12px 14px',
                background: '#F6F1EA',
                border: '1px solid rgba(43,31,23,0.08)',
                borderRadius: 999,
                fontSize: 14,
                fontFamily: 'inherit',
                color: '#2B1F17',
                outline: 'none',
                transition: 'border-color 0.25s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#D94A20'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(43,31,23,0.08)'}
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: draft.trim() ? '#D94A20' : 'rgba(43,31,23,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
                cursor: draft.trim() ? 'pointer' : 'default',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7 L12 7 M8 3 L12 7 L8 11"
                      stroke={draft.trim() ? '#FFFDFA' : '#8A7668'}
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes companion-pulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.4); }
        }
        @keyframes msg-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

// ---------- Root App ----------
export default function App() {
  const [route, setRoute] = useState('home');

  const navigate = (to) => {
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grain" style={{ minHeight: '100vh' }}>
      <GlobalStyles/>
      <Nav onNav={navigate} current={route}/>
      {(() => {
        if (route === 'home') return <HomePage onSelect={navigate}/>;
        if (route === 'login') return <LoginPage onNav={navigate}/>;
        // The three interactive panels get their own dedicated pages.
        // Notecards and diary still show the marketing teaser for now.
        const panel = PANELS.find(p => p.id === route);
        if (!panel) return <HomePage onSelect={navigate}/>;
        if (route === 'planner') return <PlannerPage panel={panel} onNav={navigate}/>;
        if (route === 'journal') return <JournalPage panel={panel} onNav={navigate}/>;
        if (route === 'workout') return <WorkoutPage panel={panel} onNav={navigate}/>;
        return <FeaturePage panelId={route} onNav={navigate}/>;
      })()}
      <Companion currentRoute={route} onNav={navigate}/>
    </div>
  );
}
