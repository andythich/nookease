import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

// ---------- Auth hook ----------
// Centralises auth state so any component can know who's signed in.
// Subscribes to Supabase's onAuthStateChange so login/logout from anywhere
// updates every consumer instantly.
const useAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate the initial session from local storage / network
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for sign-in / sign-out / token refresh events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user || null, loading };
};


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
    id: 'notebook',
    label: 'Notebook',
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

    .grain {
      /* Establishes a stacking context so .grain::before's negative z-index
         is trapped under our content but still above the body background. */
      position: relative;
      z-index: 0;
    }

    .grain::before {
      content: '';
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: -1; /* true background — under all panels, forms, and interactable UI */
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

    /* Hide horizontal scrollbar on the JS-driven carousel */
    .carousel-scroller::-webkit-scrollbar { display: none; }

    /* Mobile breakpoint — keep things from clipping into each other on phones */
    @media (max-width: 768px) {
      /* Nav: tighter padding, smaller pieces, drop the index pill on tiny screens */
      nav.site-nav { padding: 14px 18px !important; }
      nav.site-nav .nav-actions { gap: 12px !important; }
      nav.site-nav .nav-index { display: none !important; }
      nav.site-nav .nav-cta-secondary { padding: 8px 12px !important; font-size: 10px !important; }
      nav.site-nav .nav-greeting { display: none !important; }

      /* Hero: tighter padding, allow the CTA buttons to wrap */
      .home-hero { padding: 16px 20px 28px !important; }
      .home-hero-row { gap: 24px !important; }
      .home-hero-copy { max-width: 100% !important; padding-bottom: 0 !important; }
      .home-hero-cta-row { flex-wrap: wrap !important; }
      .home-hero-cta-row button { flex: 1 1 auto; }

      /* Section label row: stack instead of crashing into each other */
      .home-section-label {
        padding: 28px 20px 0 !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 6px;
      }

      /* Footer strip: stack quote and copyright */
      .home-footer {
        padding: 36px 20px !important;
        margin-top: 24px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 16px;
      }
      .home-footer-quote { font-size: 22px !important; }

      /* Ember launcher: smaller and tighter to the corner so it doesn't cover content */
      .ember-launcher {
        bottom: 16px !important;
        right: 16px !important;
        width: 52px !important;
        height: 52px !important;
      }
    }
  `}</style>
);

// ---------- Nav ----------
const Nav = ({ onNav, current, user }) => {
  const isLogin = current === 'login';
  const isHome = current === 'home';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNav('home');
  };

  // Pull a friendly first name out of metadata or email
  const displayName = user
    ? (user.user_metadata?.name?.split(' ')[0]
        || user.user_metadata?.full_name?.split(' ')[0]
        || user.email?.split('@')[0]
        || 'you')
    : null;

  return (
    <nav className="site-nav" style={{
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
      <div className="nav-actions" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span className="mono nav-index" style={{ color: '#8A7668' }}>
          {isHome ? 'Index' : isLogin ? 'Sign in' : `${PANELS.findIndex(p => p.id === current) + 1} / ${PANELS.length}`}
        </span>

        {/* Logged-out view: Log in text + Get Early Access button */}
        {!user && !isLogin && (
          <>
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
            <button onClick={() => onNav('login')} className="mono nav-cta-secondary" style={{
              padding: '10px 18px',
              border: '1px solid #2B1F17',
              borderRadius: 999,
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2B1F17'; e.currentTarget.style.color = '#F6F1EA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2B1F17'; }}
            >
              Get Early Access
            </button>
          </>
        )}

        {/* On the login page, just show a back-home link */}
        {!user && isLogin && (
          <button onClick={() => onNav('home')} className="mono nav-cta-secondary" style={{
            padding: '10px 18px',
            border: '1px solid #2B1F17',
            borderRadius: 999,
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2B1F17'; e.currentTarget.style.color = '#F6F1EA'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2B1F17'; }}
          >
            ← Back home
          </button>
        )}

        {/* Logged-in view: name + sign out */}
        {user && (
          <>
            <span className="mono nav-greeting" style={{ color: '#5C4A3E' }}>
              hi, {displayName.toLowerCase()}
            </span>
            <button onClick={handleSignOut} className="mono nav-cta-secondary" style={{
              padding: '10px 18px',
              border: '1px solid #2B1F17',
              borderRadius: 999,
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2B1F17'; e.currentTarget.style.color = '#F6F1EA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2B1F17'; }}
            >
              Sign out
            </button>
          </>
        )}
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

if (id === 'notebook') return (
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
  const scrollerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTickRef = useRef(0);
  const pauseUntilRef = useRef(0);
  // Fractional scroll accumulator. scrollLeft is rounded to integer pixels by
  // the browser when written, so 30px/s × 1/60 ≈ 0.5px per frame would round
  // away to 0 and the carousel would never auto-advance. We keep the real
  // sub-pixel position here and only push it to the DOM each frame.
  const virtualScrollRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const [hovered, setHovered] = useState(false);

  // Triple the panels so we can wrap-around in either direction without a visible
  // jump. We center on the middle copy and snap back when the user crosses an edge.
  const tripled = [...PANELS, ...PANELS, ...PANELS];

  // Auto-advance speed in pixels per second. Tuned to feel like the old 60s CSS
  // animation (~30px/s for the typical PANELS length).
  const SPEED_PX_PER_SEC = 30;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // Center on the middle copy after layout has settled. Sync the virtual
    // accumulator to the actual position so they don't drift.
    const initId = requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth / 3;
      virtualScrollRef.current = el.scrollLeft;
    });

    // RAF loop: nudges scrollLeft forward when idle, snaps the wrap when the
    // user (or the loop itself) crosses an edge copy.
    const tick = (now) => {
      const last = lastTickRef.current || now;
      const dt = (now - last) / 1000;
      lastTickRef.current = now;

      const isPaused = hovered || dragRef.current.active || now < pauseUntilRef.current;
      if (!isPaused && el) {
        // Accumulate fractionally, then write the rounded position to the DOM.
        virtualScrollRef.current += SPEED_PX_PER_SEC * dt;
        el.scrollLeft = virtualScrollRef.current;
      } else if (el) {
        // While paused (drag, hover, or wheel-cooldown) the user/wheel is
        // driving scrollLeft directly, so re-sync the accumulator to the
        // browser's actual position to avoid a jump on resume.
        virtualScrollRef.current = el.scrollLeft;
      }

      if (el) {
        const third = el.scrollWidth / 3;
        if (el.scrollLeft >= third * 2) {
          el.scrollLeft -= third;
          virtualScrollRef.current -= third;
        } else if (el.scrollLeft < third * 0.5) {
          el.scrollLeft += third;
          virtualScrollRef.current += third;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(initId);
      cancelAnimationFrame(rafRef.current);
    };
  }, [hovered]);

  // Mouse wheel: vertical wheel scroll → horizontal carousel scroll. We only
  // hijack when the wheel's dominant axis is vertical so trackpad horizontal
  // gestures fall through to the browser's default.
  const onWheel = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      virtualScrollRef.current = el.scrollLeft;
      pauseUntilRef.current = performance.now() + 1200;
    }
  };

  // Pointer events handle both mouse drag and touch swipe in one code path.
  // We deliberately do NOT call setPointerCapture — capturing the pointer on
  // the scroller div redirects the eventual click event from the panel-card
  // button to the scroller div itself, which means panel clicks never fire.
  // Instead we end the drag on pointerup OR pointerleave, which covers the
  // "user drags the cursor outside the carousel" case cleanly.
  const onPointerDown = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    const el = scrollerRef.current;
    if (el) {
      el.scrollLeft = d.startScroll - dx;
      virtualScrollRef.current = el.scrollLeft;
    }
  };
  const endDrag = () => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    pauseUntilRef.current = performance.now() + 1200;
  };

  // Suppress the click after a meaningful drag so dragging doesn't accidentally
  // open a panel. 5px is the conventional threshold. We read moved from the
  // most recent press; pointerdown resets it to 0 on the next press.
  const handleSelect = (id) => {
    if (dragRef.current.moved > 5) return;
    onSelect(id);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        padding: '40px 0',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div
        ref={scrollerRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="carousel-scroller"
        style={{
          display: 'flex',
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // pan-y lets vertical page scroll work on mobile; we only hijack horizontal.
          touchAction: 'pan-y',
          cursor: 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {tripled.map((p, i) => (
          <PanelCard key={`${p.id}-${i}`} panel={p} onClick={handleSelect}/>
        ))}
      </div>
    </div>
  );
};

// ---------- Home Page ----------
const HomePage = ({ onSelect }) => {
  const [filmOpen, setFilmOpen] = useState(false);

  return (
  <div className="fade-up" style={{ paddingTop: 120, minHeight: '100vh' }}>
    {/* Hero text */}
    <div className="home-hero" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 40px 40px' }}>
      <div className="home-hero-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 40 }}>
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
        <div className="home-hero-copy" style={{ maxWidth: 360, paddingBottom: 12 }}>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: '#5C4A3E' }}>
            NookEase is a gentle companion for the small rituals of daily life —
            planning, moving, writing, resting. One unhurried app, seven quiet rooms.
          </p>
          <div className="home-hero-cta-row" style={{ marginTop: 24, display: 'flex', gap: 12 }}>
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
            <button
              onClick={() => setFilmOpen(true)}
              style={{
                padding: '14px 22px', borderRadius: 999,
                border: '1px solid rgba(43,31,23,0.2)',
                background: 'transparent',
                color: '#2B1F17',
                fontSize: 14, fontWeight: 500,
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2B1F17'; e.currentTarget.style.color = '#F6F1EA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2B1F17'; }}
            >
              Watch film →
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Section label */}
    <div className="home-section-label" style={{
      maxWidth: 1200, margin: '0 auto', padding: '60px 40px 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span className="mono" style={{ color: '#8A7668' }}>— 02 · Seven rooms</span>
      <span className="mono" style={{ color: '#8A7668' }}>Drag, scroll, or swipe</span>
    </div>

    {/* Auto-scrolling carousel */}
    <Carousel onSelect={onSelect}/>

    {/* Footer strip */}
    <div className="home-footer" style={{
      maxWidth: 1200, margin: '40px auto 0', padding: '60px 40px',
      borderTop: '1px solid rgba(43,31,23,0.1)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
    }}>
      <div className="display home-footer-quote" style={{ fontSize: 28, fontStyle: 'italic', fontWeight: 300, color: '#2B1F17', maxWidth: 500, lineHeight: 1.3 }}>
        "Software that feels like a deep breath."
      </div>
      <span className="mono" style={{ color: '#8A7668' }}>© NookEase 2026 · Made slowly</span>
    </div>

    {/* Film modal — opens when "Watch film" is clicked. Backdrop click closes it. */}
    {filmOpen && (
      <div
        onClick={() => setFilmOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(43, 31, 23, 0.86)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
          animation: 'fade-up 0.3s ease-out',
        }}
      >
        {/* stopPropagation so clicks on the video frame don't dismiss the modal */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%', maxWidth: 1280,
            aspectRatio: '16 / 9',
            background: '#000',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 60px 120px -20px rgba(0,0,0,0.6)',
          }}
        >
          <video
            src="/nookease-film.mp4"
            autoPlay
            controls
            playsInline
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        <button
          onClick={() => setFilmOpen(false)}
          aria-label="Close film"
          className="mono"
          style={{
            position: 'absolute', top: 24, right: 24,
            padding: '10px 16px', borderRadius: 999,
            border: '1px solid rgba(246, 241, 234, 0.3)',
            background: 'transparent', color: '#F6F1EA',
            fontSize: 11, cursor: 'pointer',
          }}
        >
          Close ✕
        </button>
      </div>
    )}
  </div>
  );
};

// ============================================================
// ---------- Interactive panel pages (Planner / Journal / Workout)
// ============================================================
//
// Each page is self-contained:
//   • reads/writes its own table in Supabase (RLS keeps it user-scoped)
//   • shares the warm palette (#F6F1EA bg, #FF7A45/#D94A20 accents)
//   • uses the same .display / .mono / serif headings as the rest of the site
// ------------------------------------------------------------

// Quiet loading state — used while a panel is fetching its data from Supabase
const LoadingNote = ({ panel }) => (
  <div style={{
    maxWidth: 1200, margin: '0 auto', padding: '40px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 280,
  }}>
    <span className="mono" style={{ color: panel?.hue || '#8A7668', animation: 'soft-pulse 2s ease-in-out infinite' }}>
      gathering your things…
    </span>
  </div>
);

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
// Events live in Supabase (table: planner_events) and sync per user.
// Click a block to delete it.
const PlannerPage = ({ panel, onNav, user }) => {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // 6 AM through 11 PM is enough for most people without making the grid huge
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({
    day: 'Mon', start: '09:00', end: '10:00', title: '',
  });

  // Initial fetch
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('planner_events')
        .select('*')
        .order('created_at', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('Planner fetch error:', error);
        setEvents([]);
      } else {
        // Map db column names to the shape our UI uses
        setEvents((data || []).map(r => ({
          id: r.id, day: r.day, start: r.start_time, end: r.end_time, title: r.title,
        })));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const fmtHour = (h) => {
    const period = h >= 12 ? 'pm' : 'am';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ${period}`;
  };

  const addEvent = async () => {
    if (!draft.title.trim()) return;
    if (toMinutes(draft.end) <= toMinutes(draft.start)) return;
    const row = {
      user_id: user.id,
      day: draft.day,
      start_time: draft.start,
      end_time: draft.end,
      title: draft.title.trim(),
    };
    const { data, error } = await supabase
      .from('planner_events')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('Add event error:', error); return; }
    setEvents(prev => [...prev, {
      id: data.id, day: data.day, start: data.start_time, end: data.end_time, title: data.title,
    }]);
    setDraft({ ...draft, title: '' });
  };

  const removeEvent = async (id) => {
    // Optimistic update — the row removes immediately; if the server rejects,
    // we put it back and show the error.
    const before = events;
    setEvents(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from('planner_events').delete().eq('id', id);
    if (error) {
      console.error('Remove event error:', error);
      setEvents(before);
    }
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

      {loading ? <LoadingNote panel={panel}/> : (
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
      )}
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
// document on the right. Pages live in Supabase (table: journal_pages)
// and sync per user. We debounce content updates to avoid hammering
// the server on every keystroke.
//
// execCommand is technically deprecated but is the simplest cross-browser
// way to format contentEditable without a rich-text library, which we're
// avoiding to stay dependency-light.
const JournalPage = ({ panel, onNav, user }) => {
  const [pages, setPages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const activePage = pages.find(p => p.id === activeId) || pages[0];

  // Initial fetch — and create a starter page if the user has none yet
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('journal_pages')
        .select('*')
        .order('updated_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error('Journal fetch error:', error);
        setPages([]);
        setLoading(false);
        return;
      }
      if (!data || data.length === 0) {
        // Brand-new user: insert a starter page so the UI has something to bind to
        const { data: created, error: createErr } = await supabase
          .from('journal_pages')
          .insert({ user_id: user.id, title: 'untitled', html: '' })
          .select()
          .single();
        if (createErr) {
          console.error('Journal create error:', createErr);
          setLoading(false);
          return;
        }
        setPages([{
          id: created.id, title: created.title, html: created.html,
          updated: new Date(created.updated_at).getTime(),
        }]);
        setActiveId(created.id);
      } else {
        const mapped = data.map(r => ({
          id: r.id, title: r.title, html: r.html,
          updated: new Date(r.updated_at).getTime(),
        }));
        setPages(mapped);
        setActiveId(mapped[0].id);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // When you switch pages, swap the editor's HTML in (we keep it
  // uncontrolled to avoid the cursor jumping while typing).
  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.html) {
        editorRef.current.innerHTML = activePage.html || '';
      }
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Local update + debounced save to Supabase.
  // We update local state immediately so typing is responsive, then
  // push to Supabase 600ms after the user stops typing.
  const updateActive = (patch) => {
    if (!activePage) return;
    const now = Date.now();
    setPages(prev => prev.map(p =>
      p.id === activeId ? { ...p, ...patch, updated: now } : p
    ));
    // Debounce the network call
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('journal_pages')
        .update({
          ...(patch.title !== undefined && { title: patch.title }),
          ...(patch.html !== undefined && { html: patch.html }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeId);
      if (error) console.error('Journal save error:', error);
    }, 600);
  };

  const newPage = async () => {
    const { data, error } = await supabase
      .from('journal_pages')
      .insert({ user_id: user.id, title: 'untitled', html: '' })
      .select()
      .single();
    if (error) { console.error('New page error:', error); return; }
    const newP = {
      id: data.id, title: data.title, html: data.html,
      updated: new Date(data.updated_at).getTime(),
    };
    setPages(prev => [newP, ...prev]);
    setActiveId(data.id);
  };

  const deletePage = async (id) => {
    if (!window.confirm('Remove this page?')) return;
    const before = pages;
    const remaining = pages.filter(p => p.id !== id);
    setPages(remaining);
    if (id === activeId) {
      setActiveId(remaining[0]?.id || null);
    }
    const { error } = await supabase.from('journal_pages').delete().eq('id', id);
    if (error) {
      console.error('Delete page error:', error);
      setPages(before);
      return;
    }
    // If that was the last page, create a fresh blank one
    if (remaining.length === 0) {
      const { data: created } = await supabase
        .from('journal_pages')
        .insert({ user_id: user.id, title: 'untitled', html: '' })
        .select()
        .single();
      if (created) {
        const newP = {
          id: created.id, title: created.title, html: created.html,
          updated: new Date(created.updated_at).getTime(),
        };
        setPages([newP]);
        setActiveId(created.id);
      }
    }
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

      {(loading || !activePage) ? (
        <LoadingNote panel={panel}/>
      ) : (
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
              {pages.map(p => {
                const isActive = p.id === activeId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveId(p.id)}
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
                    {isActive && pages.length > 1 && (
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
      )}

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
// Sessions live in Supabase (table: workout_sessions) and sync per user.
// Below the form we render a hand-rolled SVG line/area chart of the
// chosen metric over time. No chart library — keeps the bundle tiny.
const WorkoutPage = ({ panel, onNav, user }) => {
  const [sessions, setSessions] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const [draft, setDraft] = useState({
    date: today, calories: '', miles: '', minutes: '',
  });
  const [weightDraft, setWeightDraft] = useState({ date: today, weight: '' });
  const [metric, setMetric] = useState('calories'); // which series to chart

  // Initial fetch — sessions + weights run in parallel
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [sessionsRes, weightsRes] = await Promise.all([
        supabase.from('workout_sessions').select('*').order('date', { ascending: true }),
        supabase.from('weight_logs').select('*').order('date', { ascending: true }),
      ]);
      if (cancelled) return;
      if (sessionsRes.error) {
        console.error('Workout fetch error:', sessionsRes.error);
        setSessions([]);
      } else {
        setSessions((sessionsRes.data || []).map(r => ({
          id: r.id, date: r.date,
          calories: Number(r.calories), miles: Number(r.miles), minutes: Number(r.minutes),
        })));
      }
      if (weightsRes.error) {
        console.error('Weight fetch error:', weightsRes.error);
        setWeights([]);
      } else {
        setWeights((weightsRes.data || []).map(r => ({
          id: r.id, date: r.date, weight: Number(r.weight),
        })));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const addSession = async () => {
    const cal = parseFloat(draft.calories);
    const mi = parseFloat(draft.miles);
    const min = parseFloat(draft.minutes);
    if (isNaN(cal) || isNaN(mi) || isNaN(min)) return;
    if (cal < 0 || mi < 0 || min < 0) return;
    const row = {
      user_id: user.id,
      date: draft.date,
      calories: cal,
      miles: mi,
      minutes: min,
    };
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('Add session error:', error); return; }
    const inserted = {
      id: data.id, date: data.date,
      calories: Number(data.calories), miles: Number(data.miles), minutes: Number(data.minutes),
    };
    setSessions(prev => [...prev, inserted].sort((a, b) => a.date.localeCompare(b.date)));
    setDraft({ date: today, calories: '', miles: '', minutes: '' });
  };

  const removeSession = async (id) => {
    const before = sessions;
    setSessions(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('workout_sessions').delete().eq('id', id);
    if (error) {
      console.error('Remove session error:', error);
      setSessions(before);
    }
  };

  const addWeight = async () => {
    const w = parseFloat(weightDraft.weight);
    if (isNaN(w) || w <= 0) return;
    const row = {
      user_id: user.id,
      date: weightDraft.date,
      weight: w,
    };
    const { data, error } = await supabase
      .from('weight_logs')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('Add weight error:', error); return; }
    const inserted = { id: data.id, date: data.date, weight: Number(data.weight) };
    setWeights(prev => [...prev, inserted].sort((a, b) => a.date.localeCompare(b.date)));
    setWeightDraft({ date: today, weight: '' });
  };

  const removeWeight = async (id) => {
    const before = weights;
    setWeights(prev => prev.filter(w => w.id !== id));
    const { error } = await supabase.from('weight_logs').delete().eq('id', id);
    if (error) {
      console.error('Remove weight error:', error);
      setWeights(before);
    }
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

  // ---------- Weight chart ----------
  // Same hand-rolled SVG approach as the cardio chart above. We give the
  // y-axis a little headroom/floor so the line doesn't sit flush on the edges.
  const wValues = weights.map(w => w.weight);
  const wRawMax = wValues.length ? Math.max(...wValues) : 0;
  const wRawMin = wValues.length ? Math.min(...wValues) : 0;
  const wRange = Math.max(1, wRawMax - wRawMin);
  const wMaxVal = wValues.length ? wRawMax + wRange * 0.15 : 10;
  const wMinVal = wValues.length ? Math.max(0, wRawMin - wRange * 0.15) : 0;

  const wxAt = (i) => weights.length <= 1
    ? padL + innerW / 2
    : padL + (i / (weights.length - 1)) * innerW;
  const wyAt = (v) => padT + innerH - ((v - wMinVal) / (wMaxVal - wMinVal)) * innerH;

  const wTickValues = Array.from({ length: ticks + 1 }, (_, i) => wMinVal + ((wMaxVal - wMinVal) / ticks) * i);

  let wLinePath = '';
  let wAreaPath = '';
  if (weights.length > 0) {
    weights.forEach((w, i) => {
      const x = wxAt(i), y = wyAt(w.weight);
      wLinePath += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    });
    if (weights.length === 1) {
      const x = wxAt(0), y = wyAt(weights[0].weight);
      wLinePath = `M ${x - 20} ${y} L ${x + 20} ${y}`;
      wAreaPath = `M ${x - 20} ${y} L ${x + 20} ${y} L ${x + 20} ${padT + innerH} L ${x - 20} ${padT + innerH} Z`;
    } else {
      const lastX = wxAt(weights.length - 1);
      const firstX = wxAt(0);
      wAreaPath = wLinePath + ` L ${lastX} ${padT + innerH} L ${firstX} ${padT + innerH} Z`;
    }
  }

  return (
    <div className="fade-up" style={{ paddingTop: 100, minHeight: '100vh' }}>
      <PanelHeader panel={panel} onNav={onNav} subtitle="Small motions, stacked. A gentle record of what your body did today." />

      {loading ? <LoadingNote panel={panel}/> : (
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

        {/* ---------- Weight section ---------- */}
        {/* A separate, quieter log: just date + weight. Same hand-rolled SVG
            chart treatment as the cardio section above. */}
        <div style={{
          marginTop: 48,
          marginBottom: 16,
        }}>
          <span className="mono" style={{ color: panel.hue }}>— Weight</span>
          <div className="display" style={{
            fontSize: 28, fontStyle: 'italic', fontWeight: 300,
            letterSpacing: '-0.02em', color: '#2B1F17', marginTop: 4,
          }}>
            a quiet number, kept over time
          </div>
        </div>

        {/* Add-weight row */}
        <div style={{
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 28,
          display: 'grid',
          gridTemplateColumns: '140px 1fr auto',
          gap: 12,
          alignItems: 'end',
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
        }}>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Date</label>
            <input
              type="date"
              value={weightDraft.date}
              onChange={e => setWeightDraft({ ...weightDraft, date: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={weightDraft.weight}
              onChange={e => setWeightDraft({ ...weightDraft, weight: e.target.value })}
              placeholder="e.g. 165.4"
              style={inputStyle}
            />
          </div>
          <button
            onClick={addWeight}
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

        {/* Weight chart */}
        <div style={{
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 20,
          padding: '24px 24px 16px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
        }}>
          <div style={{ marginBottom: 12 }}>
            <span className="mono" style={{ color: panel.hue }}>— Trend</span>
            <div className="display" style={{
              fontSize: 24, fontStyle: 'italic', fontWeight: 300,
              color: '#2B1F17', marginTop: 4,
            }}>
              weight over time
            </div>
          </div>

          {weights.length === 0 ? (
            <div style={{
              height: 240,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8A7668', fontStyle: 'italic',
            }}>
              log a weight above to see the curve.
            </div>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="wt-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={panel.hue} stopOpacity="0.35"/>
                  <stop offset="100%" stopColor={panel.hue} stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Y-axis grid + labels */}
              {wTickValues.map((t, i) => {
                const y = wyAt(t);
                return (
                  <g key={i}>
                    <line x1={padL} y1={y} x2={W - padR} y2={y}
                          stroke="#2B1F17" strokeOpacity="0.06" strokeDasharray="3 4"/>
                    <text x={padL - 8} y={y + 4} textAnchor="end"
                          fontFamily="Inter Tight" fontSize="10" fill="#8A7668">
                      {t.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* X-axis baseline */}
              <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH}
                    stroke="#2B1F17" strokeOpacity="0.2"/>

              {/* Area + line */}
              <path d={wAreaPath} fill="url(#wt-area)"/>
              <path d={wLinePath} fill="none" stroke={panel.hue} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>

              {/* Points + x-axis date labels */}
              {weights.map((w, i) => {
                const x = wxAt(i), y = wyAt(w.weight);
                const showLabel = weights.length <= 8 ||
                  i === 0 || i === weights.length - 1 ||
                  i % Math.ceil(weights.length / 6) === 0;
                const dateLabel = new Date(w.date + 'T00:00').toLocaleDateString([], { month: 'short', day: 'numeric' });
                return (
                  <g key={w.id}>
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

        {/* Weight list */}
        {weights.length > 0 && (
          <div style={{
            background: '#FFFDFA',
            border: '1px solid rgba(43,31,23,0.08)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 50px',
              padding: '14px 22px',
              borderBottom: '1px solid rgba(43,31,23,0.08)',
              background: 'rgba(255,122,69,0.04)',
            }}>
              {['Date', 'Weight (lbs)', ''].map(h => (
                <div key={h} className="mono" style={{ color: '#8A7668' }}>{h}</div>
              ))}
            </div>
            {[...weights].reverse().map(w => (
              <div key={w.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 50px',
                padding: '14px 22px',
                borderBottom: '1px solid rgba(43,31,23,0.04)',
                alignItems: 'center',
                fontSize: 14,
                color: '#2B1F17',
              }}>
                <div>{new Date(w.date + 'T00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div>{w.weight.toFixed(1)}</div>
                <button
                  onClick={() => removeWeight(w.id)}
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
      )}
    </div>
  );
};

// ---------- Notecards Page ----------
// Three internal views, switched via local state (no extra routing):
//   • 'list'   — grid of all sets, with tag filter pills
//   • 'detail' — one set: header + add-card row + card list + Study button
//   • 'study'  — flashcard mode (flip or self-graded quiz), shuffled per session
//
// Two Supabase tables:
//   notecard_sets (id, user_id, title, description, tags[], created_at)
//   notecards     (id, set_id, user_id, front, back, position, created_at)
// RLS scopes both to auth.uid() = user_id.
const NotecardsPage = ({ panel, onNav, user }) => {
  // Top-level view state — drives which sub-UI is rendered
  const [view, setView] = useState('list');     // 'list' | 'detail' | 'study'
  const [activeSetId, setActiveSetId] = useState(null);

  // Data
  const [sets, setSets] = useState([]);
  const [cards, setCards] = useState([]);       // cards for the active set only
  const [loading, setLoading] = useState(true);

  // Tag filter on the list view ('' means show all)
  const [tagFilter, setTagFilter] = useState('');

  // Initial fetch — pull all sets for this user
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('notecard_sets')
        .select('*')
        .order('updated_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error('Sets fetch error:', error);
        setSets([]);
      } else {
        setSets((data || []).map(s => ({
          id: s.id, title: s.title, description: s.description || '',
          tags: s.tags || [],
          updatedAt: new Date(s.updated_at).getTime(),
        })));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // When the user opens a set, fetch its cards
  useEffect(() => {
    if (!activeSetId) { setCards([]); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('notecards')
        .select('*')
        .eq('set_id', activeSetId)
        .order('position', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('Cards fetch error:', error);
        setCards([]);
      } else {
        setCards((data || []).map(c => ({
          id: c.id, front: c.front, back: c.back, position: c.position,
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [activeSetId]);

  const activeSet = sets.find(s => s.id === activeSetId);

  // Build the tag pill bar from all tags across all sets, deduped + sorted.
  // Hidden until at least one set has at least one tag.
  const allTags = Array.from(new Set(sets.flatMap(s => s.tags))).sort();

  const filteredSets = tagFilter
    ? sets.filter(s => s.tags.includes(tagFilter))
    : sets;

  // ------- Set CRUD -------
  const createSet = async () => {
    const { data, error } = await supabase
      .from('notecard_sets')
      .insert({ user_id: user.id, title: 'untitled set', description: '', tags: [] })
      .select()
      .single();
    if (error) { console.error('Create set error:', error); return; }
    const newSet = {
      id: data.id, title: data.title, description: data.description || '',
      tags: data.tags || [],
      updatedAt: new Date(data.updated_at).getTime(),
    };
    setSets(prev => [newSet, ...prev]);
    // Jump straight into editing the new set
    setActiveSetId(newSet.id);
    setView('detail');
  };

  const updateSet = async (id, patch) => {
    const before = sets;
    setSets(prev => prev.map(s => s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s));
    const { error } = await supabase
      .from('notecard_sets')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Update set error:', error);
      setSets(before);
    }
  };

  const deleteSet = async (id) => {
    if (!window.confirm('Delete this set and all its cards? This can\'t be undone.')) return;
    const before = sets;
    setSets(prev => prev.filter(s => s.id !== id));
    if (activeSetId === id) { setActiveSetId(null); setView('list'); }
    const { error } = await supabase.from('notecard_sets').delete().eq('id', id);
    if (error) {
      console.error('Delete set error:', error);
      setSets(before);
    }
  };

  // ------- Card CRUD -------
  const addCard = async (front, back) => {
    if (!front.trim() && !back.trim()) return;
    const nextPos = cards.length > 0 ? Math.max(...cards.map(c => c.position)) + 1 : 0;
    const { data, error } = await supabase
      .from('notecards')
      .insert({
        set_id: activeSetId, user_id: user.id,
        front: front.trim(), back: back.trim(), position: nextPos,
      })
      .select()
      .single();
    if (error) { console.error('Add card error:', error); return; }
    setCards(prev => [...prev, {
      id: data.id, front: data.front, back: data.back, position: data.position,
    }]);
  };

  // Bulk insert from CSV import. Returns a result object so the caller
  // can show a success toast or surface an error inline.
  const bulkAddCards = async (rows) => {
    if (!rows || rows.length === 0) return { ok: false, count: 0, error: 'No rows to import.' };
    const startPos = cards.length > 0 ? Math.max(...cards.map(c => c.position)) + 1 : 0;
    const payload = rows.map((r, i) => ({
      set_id: activeSetId,
      user_id: user.id,
      front: (r.front || '').trim(),
      back: (r.back || '').trim(),
      position: startPos + i,
    }));
    const { data, error } = await supabase
      .from('notecards')
      .insert(payload)
      .select();
    if (error) {
      console.error('Bulk add error:', error);
      return { ok: false, count: 0, error: error.message };
    }
    setCards(prev => [
      ...prev,
      ...(data || []).map(c => ({
        id: c.id, front: c.front, back: c.back, position: c.position,
      })),
    ]);
    return { ok: true, count: data?.length || 0 };
  };

  const updateCard = async (id, patch) => {
    const before = cards;
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    const { error } = await supabase.from('notecards').update(patch).eq('id', id);
    if (error) {
      console.error('Update card error:', error);
      setCards(before);
    }
  };

  const deleteCard = async (id) => {
    const before = cards;
    setCards(prev => prev.filter(c => c.id !== id));
    const { error } = await supabase.from('notecards').delete().eq('id', id);
    if (error) {
      console.error('Delete card error:', error);
      setCards(before);
    }
  };

  // ------- Render -------
  return (
    <div className="fade-up" style={{ paddingTop: 100, minHeight: '100vh' }}>
      <PanelHeader panel={panel} onNav={onNav} subtitle="Ideas, one at a time. Make a set, fill it slowly, study when ready." />

      {loading ? <LoadingNote panel={panel}/> : (
        view === 'list' ? (
          <NotecardsList
            sets={filteredSets}
            allSetCount={sets.length}
            allTags={allTags}
            tagFilter={tagFilter}
            setTagFilter={setTagFilter}
            onCreate={createSet}
            onOpen={(id) => { setActiveSetId(id); setView('detail'); }}
            panel={panel}
          />
        ) : view === 'detail' ? (
          <NotecardsDetail
            set={activeSet}
            cards={cards}
            onBack={() => { setView('list'); setActiveSetId(null); }}
            onUpdateSet={(patch) => updateSet(activeSet.id, patch)}
            onDeleteSet={() => deleteSet(activeSet.id)}
            onAddCard={addCard}
            onBulkAdd={bulkAddCards}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onStudy={() => setView('study')}
            panel={panel}
          />
        ) : (
          <NotecardsStudy
            set={activeSet}
            cards={cards}
            onBack={() => setView('detail')}
            panel={panel}
          />
        )
      )}
    </div>
  );
};

// ---------- Notecards: List view ----------
// Grid of set tiles + tag filter pills. The grain on each tile is intentional:
// they're soft cards, not boxes.
const NotecardsList = ({ sets, allSetCount, allTags, tagFilter, setTagFilter, onCreate, onOpen, panel }) => {
  const showTagBar = allTags.length > 0 && allSetCount > 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 80px' }}>

      {/* Tag filter row */}
      {showTagBar && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span className="mono" style={{ color: '#8A7668', marginRight: 6 }}>filter:</span>
          <TagPill label="all" active={tagFilter === ''} onClick={() => setTagFilter('')} hue={panel.hue}/>
          {allTags.map(t => (
            <TagPill key={t} label={t} active={tagFilter === t} onClick={() => setTagFilter(t)} hue={panel.hue}/>
          ))}
        </div>
      )}

      {/* Empty state */}
      {allSetCount === 0 ? (
        <div style={{
          padding: '80px 40px',
          textAlign: 'center',
          background: '#FFFDFA',
          border: '1px dashed rgba(43,31,23,0.15)',
          borderRadius: 20,
        }}>
          <p className="display" style={{
            fontSize: 32, fontWeight: 300, fontStyle: 'italic',
            color: '#2B1F17', marginBottom: 24,
          }}>
            no sets yet. let's make one.
          </p>
          <button
            onClick={onCreate}
            className="mono"
            style={{
              padding: '14px 28px',
              borderRadius: 999,
              background: panel.hue,
              color: '#FFFDFA',
              fontSize: 12,
            }}
          >
            + New set
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {/* New set tile — always first */}
          <button
            onClick={onCreate}
            style={{
              minHeight: 180,
              background: 'transparent',
              border: '2px dashed rgba(43,31,23,0.18)',
              borderRadius: 20,
              padding: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, color: '#5C4A3E',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = panel.hue; e.currentTarget.style.color = panel.hue; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(43,31,23,0.18)'; e.currentTarget.style.color = '#5C4A3E'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ fontSize: 32, fontWeight: 200 }}>+</span>
            <span className="mono">New set</span>
          </button>

          {sets.map(s => (
            <button
              key={s.id}
              onClick={() => onOpen(s.id)}
              style={{
                minHeight: 180,
                background: '#FFFDFA',
                border: '1px solid rgba(43,31,23,0.08)',
                borderRadius: 20,
                padding: '22px 24px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column',
                gap: 10,
                boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 28px -8px ${panel.hue}33`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(43,31,23,0.04)'; }}
            >
              <span className="display" style={{
                fontSize: 24, fontWeight: 400, fontStyle: 'italic',
                letterSpacing: '-0.02em', color: '#2B1F17',
                lineHeight: 1.15,
              }}>
                {s.title || 'untitled set'}
              </span>
              {s.description && (
                <p style={{ fontSize: 13, color: '#5C4A3E', lineHeight: 1.5, flex: 1 }}>
                  {s.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                {s.tags.slice(0, 4).map(t => (
                  <span key={t} className="mono" style={{
                    padding: '3px 8px',
                    background: 'rgba(255,122,69,0.08)',
                    color: panel.hue,
                    borderRadius: 999,
                    fontSize: 9,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {tagFilter && sets.length === 0 && (
        <p className="mono" style={{ color: '#8A7668', textAlign: 'center', marginTop: 32 }}>
          nothing tagged "{tagFilter}" yet.
        </p>
      )}
    </div>
  );
};

// Reusable pill button used in the tag filter row
const TagPill = ({ label, active, onClick, hue }) => (
  <button
    onClick={onClick}
    className="mono"
    style={{
      padding: '6px 14px',
      borderRadius: 999,
      background: active ? hue : '#FFFDFA',
      color: active ? '#FFFDFA' : '#5C4A3E',
      border: `1px solid ${active ? hue : 'rgba(43,31,23,0.1)'}`,
      transition: 'all 0.2s',
      fontSize: 10,
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = hue; e.currentTarget.style.color = hue; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(43,31,23,0.1)'; e.currentTarget.style.color = '#5C4A3E'; } }}
  >
    {label}
  </button>
);

// ---------- Notecards: Detail view ----------
// Editable header (title, description, tags) + add-card row + card list.
// Title/description use onBlur to save (one network call when you click away).
const NotecardsDetail = ({ set, cards, onBack, onUpdateSet, onDeleteSet, onAddCard, onBulkAdd, onUpdateCard, onDeleteCard, onStudy, panel }) => {
  // Local copies so typing is responsive; we sync to the parent state on blur.
  const [titleDraft, setTitleDraft] = useState(set?.title || '');
  const [descDraft, setDescDraft] = useState(set?.description || '');
  const [tagDraft, setTagDraft] = useState(''); // input field for new tag
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  // CSV import state — drives the preview modal that appears after file pick
  const fileInputRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
    // shape: { rows: [{front, back}, ...], filename: 'foo.csv', skipped: 0 }
  const [importBusy, setImportBusy] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
    // shape: { kind: 'success' | 'error', text: '...' }

  // Resync local state if the underlying set changes (e.g., after a tag add)
  useEffect(() => {
    setTitleDraft(set?.title || '');
    setDescDraft(set?.description || '');
  }, [set?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!set) return null;

  const commitTagDraft = () => {
    const t = tagDraft.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!t) { setTagDraft(''); return; }
    if (set.tags.includes(t)) { setTagDraft(''); return; }
    onUpdateSet({ tags: [...set.tags, t] });
    setTagDraft('');
  };

  const removeTag = (t) => {
    onUpdateSet({ tags: set.tags.filter(x => x !== t) });
  };

  const handleAddCard = () => {
    if (!newCard.front.trim() && !newCard.back.trim()) return;
    onAddCard(newCard.front, newCard.back);
    setNewCard({ front: '', back: '' });
  };

  // ---------- CSV import ----------
  // Parse a 2-column CSV (front,back). We hand-roll this rather than pull in
  // Papa Parse because (a) we control the file format, (b) it keeps the
  // bundle small, (c) the only tricky case is quoted fields with commas
  // inside, which is ~15 lines of careful code.
  const parseCSV = (text) => {
    const rows = [];
    let cur = [];           // current row's cells
    let cell = '';          // current cell being built
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        // Inside quotes: a pair of quotes means a literal quote, a single
        // quote ends the quoted section. Everything else is content.
        if (ch === '"' && next === '"') { cell += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { cell += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { cur.push(cell); cell = ''; }
        else if (ch === '\r') { /* ignore — \n handles row breaks */ }
        else if (ch === '\n') {
          cur.push(cell);
          rows.push(cur);
          cur = []; cell = '';
        } else { cell += ch; }
      }
    }
    // Final cell/row if file didn't end with a newline
    if (cell !== '' || cur.length > 0) { cur.push(cell); rows.push(cur); }
    return rows;
  };

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so the same file can be re-picked later
    if (!file) return;
    setImportMsg(null);

    // Reasonable size cap — CSVs above 5MB are unusual for flashcards
    // and start to chug the browser if we parse them on the main thread.
    if (file.size > 5 * 1024 * 1024) {
      setImportMsg({ kind: 'error', text: 'File is too large (over 5 MB). Try splitting it.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result?.toString() || '';
        const allRows = parseCSV(text);
        if (allRows.length === 0) {
          setImportMsg({ kind: 'error', text: 'No rows found in this file.' });
          return;
        }

        // If row 0 looks like a header (cells equal "front" and "back",
        // case-insensitive), drop it. Otherwise keep it as data.
        const looksLikeHeader = allRows[0].length >= 2
          && allRows[0][0].trim().toLowerCase() === 'front'
          && allRows[0][1].trim().toLowerCase() === 'back';
        const dataRows = looksLikeHeader ? allRows.slice(1) : allRows;

        // Filter to rows that have at least front OR back (skip blank lines)
        let skipped = 0;
        const cards = dataRows
          .map(r => ({ front: (r[0] || '').trim(), back: (r[1] || '').trim() }))
          .filter(r => {
            if (!r.front && !r.back) { skipped++; return false; }
            return true;
          });

        if (cards.length === 0) {
          setImportMsg({ kind: 'error', text: 'No usable cards found in this file.' });
          return;
        }
        setImportPreview({ rows: cards, filename: file.name, skipped });
      } catch (err) {
        setImportMsg({ kind: 'error', text: 'Could not read this file as CSV.' });
        console.error('CSV parse error:', err);
      }
    };
    reader.onerror = () => {
      setImportMsg({ kind: 'error', text: 'Could not read the file.' });
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    setImportBusy(true);
    const result = await onBulkAdd(importPreview.rows);
    setImportBusy(false);
    setImportPreview(null);
    if (result.ok) {
      setImportMsg({ kind: 'success', text: `Added ${result.count} ${result.count === 1 ? 'card' : 'cards'}.` });
    } else {
      setImportMsg({ kind: 'error', text: result.error || 'Something went wrong during import.' });
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
      <button
        onClick={onBack}
        className="mono"
        style={{ color: '#8A7668', marginBottom: 24 }}
      >
        ← All sets
      </button>

      {/* Editable header */}
      <div style={{
        background: '#FFFDFA',
        border: '1px solid rgba(43,31,23,0.08)',
        borderRadius: 20,
        padding: '28px 30px',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
      }}>
        <input
          value={titleDraft}
          onChange={e => setTitleDraft(e.target.value)}
          onBlur={() => { if (titleDraft !== set.title) onUpdateSet({ title: titleDraft || 'untitled set' }); }}
          placeholder="untitled set"
          className="display"
          style={{
            border: 'none', outline: 'none',
            fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 300, fontStyle: 'italic',
            letterSpacing: '-0.02em', color: '#2B1F17',
            background: 'transparent', width: '100%',
            fontFamily: 'Fraunces, serif',
            marginBottom: 8,
          }}
        />
        <textarea
          value={descDraft}
          onChange={e => setDescDraft(e.target.value)}
          onBlur={() => { if (descDraft !== set.description) onUpdateSet({ description: descDraft }); }}
          placeholder="add a quiet note about this set…"
          rows={2}
          style={{
            border: 'none', outline: 'none',
            fontSize: 15, lineHeight: 1.55,
            color: '#5C4A3E', fontStyle: 'italic',
            background: 'transparent', width: '100%',
            fontFamily: 'inherit',
            resize: 'none',
            marginBottom: 14,
          }}
        />

        {/* Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="mono" style={{ color: '#8A7668', marginRight: 4 }}>tags:</span>
          {set.tags.map(t => (
            <span key={t} className="mono" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 8px 4px 10px',
              background: 'rgba(255,122,69,0.08)',
              color: panel.hue,
              borderRadius: 999,
              fontSize: 10,
            }}>
              {t}
              <button onClick={() => removeTag(t)} title="Remove tag" style={{
                color: panel.hue, opacity: 0.7, fontSize: 14, lineHeight: 1, padding: '0 2px',
              }}>×</button>
            </span>
          ))}
          <input
            value={tagDraft}
            onChange={e => setTagDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',' || e.key === ' ') { e.preventDefault(); commitTagDraft(); }
              if (e.key === 'Backspace' && !tagDraft && set.tags.length > 0) { removeTag(set.tags[set.tags.length - 1]); }
            }}
            onBlur={commitTagDraft}
            placeholder={set.tags.length === 0 ? 'add a tag…' : '+'}
            className="mono"
            style={{
              border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 10, color: '#2B1F17',
              fontFamily: 'inherit',
              minWidth: 80, padding: '4px 0',
            }}
          />
        </div>

        {/* Set-level actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(43,31,23,0.06)' }}>
          <button
            onClick={onStudy}
            disabled={cards.length === 0}
            className="mono"
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              background: cards.length === 0 ? 'rgba(43,31,23,0.1)' : panel.hue,
              color: cards.length === 0 ? '#8A7668' : '#FFFDFA',
              cursor: cards.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { if (cards.length > 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px -8px ${panel.hue}88`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Study →
          </button>
          <span className="mono" style={{ color: '#8A7668', alignSelf: 'center' }}>
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </span>

          {/* Hidden file input — triggered by the Import button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFilePicked}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mono"
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid rgba(43,31,23,0.12)',
              color: '#5C4A3E',
              marginLeft: 'auto',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = panel.hue; e.currentTarget.style.color = panel.hue; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(43,31,23,0.12)'; e.currentTarget.style.color = '#5C4A3E'; }}
          >
            Import CSV
          </button>

          <button
            onClick={onDeleteSet}
            className="mono"
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid rgba(43,31,23,0.12)',
              color: '#8A7668',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D94A20'; e.currentTarget.style.color = '#D94A20'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(43,31,23,0.12)'; e.currentTarget.style.color = '#8A7668'; }}
          >
            Delete set
          </button>
        </div>

        {/* Inline import status (success / error toast that persists until next action) */}
        {importMsg && (
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            background: importMsg.kind === 'success' ? 'rgba(74,157,95,0.08)' : 'rgba(217,74,32,0.08)',
            border: `1px solid ${importMsg.kind === 'success' ? 'rgba(74,157,95,0.25)' : 'rgba(217,74,32,0.25)'}`,
            borderRadius: 10,
            fontSize: 13, lineHeight: 1.4,
            color: importMsg.kind === 'success' ? '#2C6B40' : '#A8391A',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <span>{importMsg.text}</span>
            <button
              onClick={() => setImportMsg(null)}
              style={{ color: 'inherit', opacity: 0.6, fontSize: 16, lineHeight: 1, padding: '0 4px' }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Import preview modal — appears after a file is parsed */}
      {importPreview && (
        <div
          onClick={() => !importBusy && setImportPreview(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(43,31,23,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFDFA',
              borderRadius: 20,
              padding: '32px 36px',
              maxWidth: 520, width: '100%',
              boxShadow: '0 20px 60px -10px rgba(43,31,23,0.4)',
            }}
          >
            <p className="mono" style={{ color: panel.hue, marginBottom: 10 }}>preview</p>
            <p className="display" style={{
              fontSize: 28, fontWeight: 300, fontStyle: 'italic',
              letterSpacing: '-0.02em', color: '#2B1F17',
              lineHeight: 1.15, marginBottom: 14,
            }}>
              {importPreview.rows.length} {importPreview.rows.length === 1 ? 'card' : 'cards'} ready to add
            </p>
            <p style={{ fontSize: 14, color: '#5C4A3E', lineHeight: 1.55, marginBottom: 18 }}>
              From <span style={{ color: '#2B1F17', fontFamily: 'monospace' }}>{importPreview.filename}</span>.
              {importPreview.skipped > 0 && ` ${importPreview.skipped} blank ${importPreview.skipped === 1 ? 'row was' : 'rows were'} skipped.`}
              {' '}They'll be appended to "{set.title || 'this set'}".
            </p>

            {/* Tiny preview of the first 3 cards */}
            <div style={{
              background: '#F6F1EA',
              border: '1px solid rgba(43,31,23,0.06)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 22,
              maxHeight: 160, overflowY: 'auto',
            }}>
              {importPreview.rows.slice(0, 3).map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: '#5C4A3E', padding: '4px 0', borderBottom: i < 2 && importPreview.rows.length > 1 ? '1px dashed rgba(43,31,23,0.08)' : 'none' }}>
                  <span style={{ color: '#2B1F17' }}>{r.front.length > 60 ? r.front.slice(0, 60) + '…' : r.front}</span>
                  <span style={{ color: '#8A7668' }}> → {r.back.length > 60 ? r.back.slice(0, 60) + '…' : r.back}</span>
                </div>
              ))}
              {importPreview.rows.length > 3 && (
                <div style={{ fontSize: 11, color: '#8A7668', fontStyle: 'italic', paddingTop: 6 }}>
                  …and {importPreview.rows.length - 3} more.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setImportPreview(null)}
                disabled={importBusy}
                className="mono"
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: '1px solid rgba(43,31,23,0.12)',
                  color: '#5C4A3E',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                disabled={importBusy}
                className="mono"
                style={{
                  padding: '10px 22px',
                  borderRadius: 999,
                  background: panel.hue,
                  color: '#FFFDFA',
                  opacity: importBusy ? 0.7 : 1,
                  cursor: importBusy ? 'wait' : 'pointer',
                }}
              >
                {importBusy ? 'adding…' : `Add ${importPreview.rows.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add a card */}
      <div style={{
        background: '#FFFDFA',
        border: '1px solid rgba(43,31,23,0.08)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: 12,
        alignItems: 'end',
        boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
      }}>
        <div>
          <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Front</label>
          <input
            value={newCard.front}
            onChange={e => setNewCard({ ...newCard, front: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') handleAddCard(); }}
            placeholder="the question, term, or prompt"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="mono" style={{ color: '#8A7668', display: 'block', marginBottom: 6 }}>Back</label>
          <input
            value={newCard.back}
            onChange={e => setNewCard({ ...newCard, back: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') handleAddCard(); }}
            placeholder="the answer, definition, or response"
            style={inputStyle}
          />
        </div>
        <button
          onClick={handleAddCard}
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
          Add card
        </button>
      </div>

      {/* Card list */}
      {cards.length === 0 ? (
        <p className="mono" style={{ color: '#8A7668', textAlign: 'center', padding: '40px 0' }}>
          no cards yet. add the first one above.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map((c, idx) => (
            <CardRow
              key={c.id}
              index={idx + 1}
              card={c}
              onUpdate={(patch) => onUpdateCard(c.id, patch)}
              onDelete={() => onDeleteCard(c.id)}
              hue={panel.hue}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Inline-editable card row in the detail view
const CardRow = ({ index, card, onUpdate, onDelete, hue }) => {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  // Resync if the card changes from elsewhere
  useEffect(() => { setFront(card.front); setBack(card.back); }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: '#FFFDFA',
      border: '1px solid rgba(43,31,23,0.08)',
      borderRadius: 14,
      padding: '14px 18px',
      display: 'grid',
      gridTemplateColumns: '40px 1fr 1fr 36px',
      gap: 14,
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(43,31,23,0.03)',
    }}>
      <span className="mono" style={{ color: '#8A7668' }}>{String(index).padStart(2, '0')}</span>
      <input
        value={front}
        onChange={e => setFront(e.target.value)}
        onBlur={() => { if (front !== card.front) onUpdate({ front }); }}
        placeholder="front"
        style={{
          border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, color: '#2B1F17', width: '100%', fontFamily: 'inherit',
        }}
      />
      <input
        value={back}
        onChange={e => setBack(e.target.value)}
        onBlur={() => { if (back !== card.back) onUpdate({ back }); }}
        placeholder="back"
        style={{
          border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, color: '#5C4A3E', width: '100%', fontFamily: 'inherit',
        }}
      />
      <button
        onClick={onDelete}
        title="Remove card"
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
  );
};

// ---------- Notecards: Study view ----------
// Two modes:
//   • 'flip'  — click card to reveal the back
//   • 'quiz'  — same flip, plus "got it" / "review again" buttons; tally at the end
// Cards are shuffled once on entering the study session and stay in that order
// until the user goes back and re-enters.
const NotecardsStudy = ({ set, cards, onBack, panel }) => {
  const [mode, setMode] = useState('flip'); // 'flip' | 'quiz'
  const [order, setOrder] = useState([]);   // shuffled indices into `cards`
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [grades, setGrades] = useState({}); // { cardId: 'correct' | 'review' }

  // Shuffle on mount and whenever the cards array identity changes (e.g. user
  // edits cards then comes back). Also reshuffles on "Restart".
  const shuffle = () => {
    const idx = cards.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    setOrder(idx);
    setPos(0);
    setFlipped(false);
    setGrades({});
  };

  useEffect(() => { shuffle(); }, [cards.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!set || cards.length === 0 || order.length === 0) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 40px', textAlign: 'center' }}>
        <p style={{ color: '#5C4A3E', fontStyle: 'italic' }}>no cards to study yet.</p>
        <button onClick={onBack} className="mono" style={{ marginTop: 16, color: panel.hue }}>← Back</button>
      </div>
    );
  }

  const card = cards[order[pos]];
  const isLast = pos === order.length - 1;
  const done = isLast && flipped && (mode === 'flip' || grades[card.id]);

  // For the quiz tally
  const correctCount = Object.values(grades).filter(g => g === 'correct').length;
  const reviewCount = Object.values(grades).filter(g => g === 'review').length;
  const allGraded = mode === 'quiz' && Object.keys(grades).length === order.length;

  const next = () => {
    if (isLast) return;
    setPos(p => p + 1);
    setFlipped(false);
  };
  const prev = () => {
    if (pos === 0) return;
    setPos(p => p - 1);
    setFlipped(false);
  };

  const grade = (verdict) => {
    setGrades(g => ({ ...g, [card.id]: verdict }));
    // Auto-advance after a brief moment
    setTimeout(() => {
      if (!isLast) { setPos(p => p + 1); setFlipped(false); }
    }, 250);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px 80px' }}>

      {/* Top row: back link + mode toggle + counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button onClick={onBack} className="mono" style={{ color: '#8A7668' }}>
          ← {set.title || 'set'}
        </button>
        <div style={{ display: 'flex', gap: 6, background: '#F6F1EA', padding: 4, borderRadius: 10 }}>
          {[{ k: 'flip', l: 'Flip' }, { k: 'quiz', l: 'Quiz' }].map(m => (
            <button
              key={m.k}
              onClick={() => { setMode(m.k); setGrades({}); }}
              className="mono"
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: mode === m.k ? '#FFFDFA' : 'transparent',
                color: mode === m.k ? '#2B1F17' : '#8A7668',
                boxShadow: mode === m.k ? '0 1px 3px rgba(43,31,23,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {m.l}
            </button>
          ))}
        </div>
        <span className="mono" style={{ color: '#8A7668' }}>
          {pos + 1} / {order.length}
        </span>
      </div>

      {/* Quiz summary appears when every card has been graded */}
      {allGraded ? (
        <div style={{
          background: '#FFFDFA',
          border: '1px solid rgba(43,31,23,0.08)',
          borderRadius: 24,
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(43,31,23,0.04)',
        }}>
          <p className="mono" style={{ color: panel.hue, marginBottom: 14 }}>session complete</p>
          <p className="display" style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 300, fontStyle: 'italic',
            letterSpacing: '-0.02em', color: '#2B1F17',
            lineHeight: 1.05, marginBottom: 28,
          }}>
            {correctCount} of {order.length}.
          </p>
          <p style={{ color: '#5C4A3E', fontSize: 16, marginBottom: 32 }}>
            {reviewCount === 0
              ? 'a clean run. set it down and come back tomorrow.'
              : `${reviewCount} to revisit. small motions, stacked.`}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={shuffle}
              className="mono"
              style={{
                padding: '12px 24px', borderRadius: 999,
                background: panel.hue, color: '#FFFDFA',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px -8px ${panel.hue}88`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Shuffle & study again
            </button>
            <button
              onClick={onBack}
              className="mono"
              style={{
                padding: '12px 24px', borderRadius: 999,
                border: '1px solid rgba(43,31,23,0.15)', color: '#2B1F17',
              }}
            >
              Back to set
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* The card itself */}
          <div
            onClick={() => setFlipped(f => !f)}
            style={{
              background: '#FFFDFA',
              border: `1px solid ${flipped ? panel.hue + '55' : 'rgba(43,31,23,0.08)'}`,
              borderRadius: 24,
              padding: '40px',
              minHeight: 320,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer',
              boxShadow: flipped
                ? `0 12px 32px -10px ${panel.hue}33`
                : '0 2px 12px rgba(43,31,23,0.05)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            <span className="mono" style={{
              position: 'absolute', top: 18, left: 22,
              color: flipped ? panel.hue : '#8A7668',
              transition: 'color 0.3s',
            }}>
              {flipped ? 'back' : 'front'}
            </span>
            <p className="display" style={{
              fontSize: 'clamp(20px, 2.6vw, 30px)',
              fontWeight: 300, fontStyle: flipped ? 'italic' : 'normal',
              letterSpacing: '-0.01em',
              color: '#2B1F17',
              textAlign: 'left', lineHeight: 1.4,
              maxWidth: '90%',
              whiteSpace: 'pre-line',
            }}>
              {flipped ? (card.back || '—') : (card.front || '—')}
            </p>
            <span className="mono" style={{
              position: 'absolute', bottom: 18, color: '#8A7668', fontSize: 9,
            }}>
              {flipped ? 'click to hide' : 'click to flip'}
            </span>
          </div>

          {/* Controls under the card */}
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={prev}
              disabled={pos === 0}
              className="mono"
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid rgba(43,31,23,0.12)',
                color: pos === 0 ? 'rgba(43,31,23,0.3)' : '#2B1F17',
                cursor: pos === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Prev
            </button>

            {mode === 'quiz' && flipped ? (
              <>
                <button
                  onClick={() => grade('review')}
                  className="mono"
                  style={{
                    padding: '10px 20px', borderRadius: 999,
                    border: '1px solid rgba(217,74,32,0.3)',
                    background: grades[card.id] === 'review' ? '#D94A20' : 'transparent',
                    color: grades[card.id] === 'review' ? '#FFFDFA' : '#D94A20',
                    transition: 'all 0.2s',
                  }}
                >
                  Review again
                </button>
                <button
                  onClick={() => grade('correct')}
                  className="mono"
                  style={{
                    padding: '10px 20px', borderRadius: 999,
                    border: `1px solid ${panel.hue}55`,
                    background: grades[card.id] === 'correct' ? panel.hue : 'transparent',
                    color: grades[card.id] === 'correct' ? '#FFFDFA' : panel.hue,
                    transition: 'all 0.2s',
                  }}
                >
                  Got it ✓
                </button>
              </>
            ) : (
              <button
                onClick={next}
                disabled={isLast}
                className="mono"
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  background: isLast ? 'rgba(43,31,23,0.1)' : panel.hue,
                  color: isLast ? '#8A7668' : '#FFFDFA',
                  cursor: isLast ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            )}
          </div>

          {/* Quiz progress indicator */}
          {mode === 'quiz' && Object.keys(grades).length > 0 && !allGraded && (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <span className="mono" style={{ color: '#8A7668' }}>
                {correctCount} got it · {reviewCount} to review
              </span>
            </div>
          )}

          {/* Reshuffle option, always available */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button onClick={shuffle} className="mono" style={{ color: '#8A7668', fontStyle: 'italic' }}>
              shuffle & restart
            </button>
          </div>
        </>
      )}
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
            { k: 'Privacy', v: 'Yours, encrypted', t: 'Your data lives in your account, encrypted in transit and at rest. Export anytime, delete in one tap.' },
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null); // for "check your email" / reset confirmation

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error: err } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: form.name ? { name: form.name } : undefined,
          },
        });
        if (err) {
          setError(err.message);
        } else if (data.user && !data.session) {
          // Email confirmation is on — Supabase sent a verification email.
          setNotice('Check your inbox to confirm your email. We\'ll see you soon.');
        }
        // If a session is returned immediately, the auth listener in App will route home.
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (err) setError(err.message);
        // Successful login: the auth listener navigates home.
      }
    } catch (err) {
      setError(err.message || 'Something went quietly wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // After Google sends them back, land them on the home page.
          // Supabase parses the auth fragment and our listener picks it up.
          redirectTo: window.location.origin,
        },
      });
      if (err) setError(err.message);
      // On success the browser is redirected away; nothing else to do.
    } catch (err) {
      setError(err.message || 'Google sign-in didn\'t respond. Please try again.');
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setNotice(null);
    if (!form.email) {
      setError('Enter your email above first, then tap "Forgot password" again.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: window.location.origin,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setNotice('If that email is registered, a reset link is on its way.');
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
            onClick={handleGoogle}
            disabled={busy}
            style={{
              padding: '16px 18px',
              background: '#FFFDFA',
              border: '1px solid rgba(43,31,23,0.12)',
              borderRadius: 14,
              fontSize: 15, fontWeight: 500,
              color: '#2B1F17',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              transition: 'all 0.25s',
              opacity: busy ? 0.6 : 1,
              cursor: busy ? 'wait' : 'pointer',
            }}
            onMouseEnter={e => { if (!busy) { e.currentTarget.style.borderColor = '#2B1F17'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
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
              <button type="button" onClick={handleReset} style={{ fontSize: 13, color: '#5C4A3E', fontStyle: 'italic' }}>
                Forgot password?
              </button>
            </div>
          )}

          {/* Inline error / notice strip */}
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(217,74,32,0.08)',
              border: '1px solid rgba(217,74,32,0.25)',
              borderRadius: 10,
              fontSize: 13, lineHeight: 1.4,
              color: '#A8391A',
            }}>
              {error}
            </div>
          )}
          {notice && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(74,157,95,0.08)',
              border: '1px solid rgba(74,157,95,0.25)',
              borderRadius: 10,
              fontSize: 13, lineHeight: 1.4,
              color: '#2C6B40',
            }}>
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: '16px 22px',
              background: '#D94A20',
              color: '#FFFDFA',
              borderRadius: 14,
              fontSize: 15, fontWeight: 500,
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: busy ? 0.7 : 1,
              cursor: busy ? 'wait' : 'pointer',
            }}
            onMouseEnter={e => { if (!busy) e.currentTarget.style.background = '#2B1F17'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#D94A20'; }}
          >
            {busy ? 'one moment…' : (isSignup ? 'Create your account' : 'Enter NookEase')}
            {!busy && (
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="#FFFDFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
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
    message: "Your data lives in your NookEase account — encrypted in transit, encrypted at rest, and yours. You can export everything anytime, or delete it all in one tap. We never sell data.",
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
        className="ember-launcher"
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

// ---------- Notebook Page ----------
// Three internal views, mirroring the Notecards pattern:
//   'list'  — the shelf of notebooks (tile grid + "+ New notebook" tile)
//   'open'  — a single notebook open to a dated page, with prev/next page flip
//   'toc'   — table of contents for the active notebook (list of dated entries)
//
// Two Supabase tables (see schema notes at the bottom of this file):
//   notebooks         (id, user_id, title, created_at, updated_at)
//   notebook_entries  (id, notebook_id, user_id, entry_date, content,
//                      created_at, updated_at)  UNIQUE(notebook_id, entry_date)
//
// "entry_date" is a DATE (YYYY-MM-DD) so each notebook has at most one entry
// per day. Opening a notebook lands on today's page. If today has no row yet,
// we show a blank page; the row gets inserted lazily on the first keystroke.
const NotebookPage = ({ panel, onNav, user }) => {
  // ----- helpers -----
  const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const formatLong = (ymd) => {
    if (!ymd) return '';
    // Parse as local (not UTC) to avoid the off-by-one timezone trap
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  };
  const addDays = (ymd, n) => {
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + n);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // ----- state -----
  const [view, setView] = useState('list');           // 'list' | 'open' | 'toc'
  const [notebooks, setNotebooks] = useState([]);
  const [entries, setEntries] = useState([]);          // entries for active notebook only
  const [activeNotebookId, setActiveNotebookId] = useState(null);
  const [activeDate, setActiveDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [flipping, setFlipping] = useState(null);      // null | 'forward' | 'back'
  const [editingTitle, setEditingTitle] = useState(false);

  const saveTimerRef = useRef(null);
  const flipTimerRef = useRef(null);
  const textareaRef = useRef(null);

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);
  const activeEntry = entries.find(e => e.entry_date === activeDate);

  // ----- initial fetch: load all notebooks for this user -----
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('updated_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error('Notebooks fetch error:', error);
        setNotebooks([]);
      } else {
        setNotebooks(data || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // ----- when a notebook becomes active, load its entries -----
  useEffect(() => {
    if (!activeNotebookId || !user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('notebook_entries')
        .select('*')
        .eq('notebook_id', activeNotebookId)
        .order('entry_date', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error('Entries fetch error:', error);
        setEntries([]);
      } else {
        setEntries(data || []);
      }
    })();
    return () => { cancelled = true; };
  }, [activeNotebookId, user]);

  // ----- create a new notebook -----
  const newNotebook = async () => {
    const { data, error } = await supabase
      .from('notebooks')
      .insert({ user_id: user.id, title: 'untitled notebook' })
      .select()
      .single();
    if (error) { console.error('New notebook error:', error); return; }
    setNotebooks(prev => [data, ...prev]);
    // Open it straight away so the user can rename + start writing
    setActiveNotebookId(data.id);
    setEntries([]);
    setActiveDate(todayStr());
    setView('open');
  };

  // ----- rename the active notebook (debounced) -----
  const renameNotebook = (title) => {
    if (!activeNotebookId) return;
    setNotebooks(prev => prev.map(n =>
      n.id === activeNotebookId ? { ...n, title } : n
    ));
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('notebooks')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', activeNotebookId);
      if (error) console.error('Rename notebook error:', error);
    }, 600);
  };

  // ----- delete the active notebook -----
  const deleteNotebook = async () => {
    if (!activeNotebookId) return;
    if (!window.confirm('Remove this notebook and all its entries? This can\'t be undone.')) return;
    const id = activeNotebookId;
    const before = notebooks;
    setNotebooks(prev => prev.filter(n => n.id !== id));
    setActiveNotebookId(null);
    setEntries([]);
    setView('list');
    // notebook_entries.notebook_id has ON DELETE CASCADE so children go with it
    const { error } = await supabase.from('notebooks').delete().eq('id', id);
    if (error) {
      console.error('Delete notebook error:', error);
      setNotebooks(before);
    }
  };

  // ----- update / create today's entry on typing -----
  // Optimistic local update + 600ms debounced upsert. We use upsert keyed on
  // (notebook_id, entry_date) so the first keystroke on a fresh day creates
  // the row and subsequent keystrokes update it.
  const updateEntryContent = (content) => {
    const date = activeDate;
    const nbId = activeNotebookId;
    if (!nbId) return;

    setEntries(prev => {
      const existing = prev.find(e => e.entry_date === date);
      if (existing) {
        return prev.map(e => e.entry_date === date
          ? { ...e, content, updated_at: new Date().toISOString() }
          : e);
      }
      // Optimistic placeholder; the real id will arrive after upsert
      return [{
        id: `tmp-${date}`,
        notebook_id: nbId,
        user_id: user.id,
        entry_date: date,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, ...prev];
    });

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('notebook_entries')
        .upsert({
          user_id: user.id,
          notebook_id: nbId,
          entry_date: date,
          content,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'notebook_id,entry_date' })
        .select()
        .single();
      if (error) {
        console.error('Entry save error:', error);
        return;
      }
      // Replace any tmp- placeholder with the real row
      setEntries(prev => prev.map(e =>
        e.entry_date === date ? data : e
      ));
      // Bump notebook updated_at so the shelf sorts recent on top
      setNotebooks(prev => prev.map(n =>
        n.id === nbId ? { ...n, updated_at: new Date().toISOString() } : n
      ));
    }, 600);
  };

  // ----- page flip animation -----
  // We don't do a true 3D backface flip — instead we tilt + fade the page out,
  // swap the date at the midpoint, then tilt + fade back in. ~500ms total.
  // Keyframes are defined in the inline <style> at the bottom of this component.
  const flipTo = (newDate, direction) => {
    if (flipping) return;            // ignore rapid double-clicks
    // Persist any pending edit before we navigate away
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      // Force-flush by writing whatever's currently in state
      const cur = entries.find(e => e.entry_date === activeDate);
      if (cur && !String(cur.id).startsWith('tmp-')) {
        supabase.from('notebook_entries').update({
          content: cur.content,
          updated_at: new Date().toISOString(),
        }).eq('id', cur.id).then(({ error }) => {
          if (error) console.error('Flush save error:', error);
        });
      }
    }
    setFlipping(direction);
    // At ~250ms (mid-flip, page edge-on) swap the date
    flipTimerRef.current = setTimeout(() => {
      setActiveDate(newDate);
    }, 250);
    // At 500ms clear the flipping state to release the animation
    setTimeout(() => setFlipping(null), 500);
  };
  useEffect(() => () => clearTimeout(flipTimerRef.current), []);

  const goPrevDay = () => flipTo(addDays(activeDate, -1), 'back');
  const goNextDay = () => flipTo(addDays(activeDate, 1), 'forward');

  // ----- entries that actually have content (for the table of contents) -----
  const populatedEntries = entries
    .filter(e => e.content && e.content.trim().length > 0)
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date));

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    <div style={{ paddingBottom: 80 }}>
      <PanelHeader panel={panel} onNav={onNav} subtitle="A dated companion. Open a notebook, find today's page, write what the day was." />

      {loading ? <LoadingNote panel={panel}/> : (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>

          {/* ============== LIST VIEW: shelf of notebooks ============== */}
          {view === 'list' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 20,
              }}>
                {/* + New notebook tile (always first) */}
                <button
                  onClick={newNotebook}
                  style={{
                    background: 'transparent',
                    border: `1.5px dashed ${panel.hue}`,
                    borderRadius: 10,
                    minHeight: 200,
                    padding: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    color: panel.hue,
                    transition: 'background 200ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(242, 99, 58, 0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 28, fontWeight: 300 }}>+</span>
                  <span className="mono" style={{ fontSize: 13 }}>new notebook</span>
                </button>

                {/* Existing notebooks */}
                {notebooks.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setActiveNotebookId(n.id);
                      setActiveDate(todayStr());
                      setView('open');
                    }}
                    style={{
                      background: '#FFFDFA',
                      border: '1px solid rgba(43, 31, 23, 0.12)',
                      borderRadius: 10,
                      minHeight: 200,
                      padding: '24px 22px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 14,
                      textAlign: 'left',
                      transition: 'transform 200ms, box-shadow 200ms',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(43, 31, 23, 0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Tiny notebook spine illustration */}
                    <div style={{
                      width: '100%', height: 80,
                      background: `linear-gradient(135deg, ${panel.hue}22, ${panel.hue}11)`,
                      borderRadius: 4,
                      borderLeft: `4px solid ${panel.hue}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="display" style={{
                        fontSize: 26, fontStyle: 'italic',
                        color: panel.hue, opacity: 0.85,
                      }}>
                        {(n.title || 'untitled').charAt(0).toLowerCase()}
                      </span>
                    </div>
                    <div style={{ width: '100%' }}>
                      <div className="display" style={{
                        fontSize: 18, fontStyle: 'italic',
                        color: '#2B1F17', marginBottom: 6,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {n.title || 'untitled'}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: '#8A7668' }}>
                        updated {new Date(n.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {notebooks.length === 0 && (
                <p style={{
                  marginTop: 30, fontStyle: 'italic',
                  color: '#8A7668', textAlign: 'center',
                }}>
                  no notebooks yet. start one above.
                </p>
              )}
            </div>
          )}

          {/* ============== OPEN VIEW: a single notebook page ============== */}
          {view === 'open' && activeNotebook && (
            <div>
              {/* Top bar: back to shelf, editable title, ToC button */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                marginBottom: 24, flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => { setView('list'); setActiveNotebookId(null); }}
                  className="mono"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#8A7668', padding: '6px 0',
                  }}
                >
                  ← shelf
                </button>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {editingTitle ? (
                    <input
                      autoFocus
                      value={activeNotebook.title || ''}
                      onChange={e => renameNotebook(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
                      className="display"
                      style={{
                        fontSize: 24, fontStyle: 'italic',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${panel.hue}`,
                        outline: 'none', color: '#2B1F17',
                        width: '100%', padding: '4px 0',
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="display"
                      style={{
                        background: 'transparent', border: 'none', cursor: 'text',
                        fontSize: 24, fontStyle: 'italic',
                        color: '#2B1F17', padding: '4px 0',
                        textAlign: 'left',
                      }}
                      title="click to rename"
                    >
                      {activeNotebook.title || 'untitled'}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setView('toc')}
                  className="mono"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${panel.hue}55`,
                    color: panel.hue,
                    padding: '6px 14px', borderRadius: 999,
                    cursor: 'pointer', fontSize: 12,
                  }}
                >
                  contents
                </button>
                <button
                  onClick={deleteNotebook}
                  className="mono"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#8A7668', fontSize: 12,
                  }}
                  title="delete this notebook"
                >
                  delete
                </button>
              </div>

              {/* The notebook page itself */}
              <div style={{
                position: 'relative',
                perspective: 1600,
                margin: '0 auto',
              }}>
                <div
                  className={
                    'notebook-page' +
                    (flipping === 'forward' ? ' flipping-forward' : '') +
                    (flipping === 'back' ? ' flipping-back' : '')
                  }
                  style={{
                    background: '#FFFDFA',
                    border: '1px solid rgba(43, 31, 23, 0.15)',
                    borderRadius: '2px 12px 12px 2px',
                    borderLeft: `4px solid ${panel.hue}`,
                    minHeight: 540,
                    padding: '36px 44px 44px 56px',
                    boxShadow: '0 12px 32px rgba(43, 31, 23, 0.08)',
                    position: 'relative',
                    transformOrigin: 'left center',
                  }}
                >
                  {/* Date heading */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    paddingBottom: 14,
                    borderBottom: '1px dashed rgba(43, 31, 23, 0.15)',
                  }}>
                    <h2 className="display" style={{
                      fontSize: 28, fontStyle: 'italic',
                      color: '#2B1F17', fontWeight: 400,
                    }}>
                      {formatLong(activeDate)}
                    </h2>
                    {activeDate === todayStr() && (
                      <span className="mono" style={{
                        fontSize: 11, color: panel.hue,
                        background: `${panel.hue}15`,
                        padding: '3px 10px', borderRadius: 999,
                      }}>
                        today
                      </span>
                    )}
                  </div>

                  {/* The actual writing area */}
                  <textarea
                    ref={textareaRef}
                    value={activeEntry?.content || ''}
                    onChange={e => updateEntryContent(e.target.value)}
                    placeholder="how was the day…"
                    style={{
                      width: '100%',
                      minHeight: 380,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'Inter Tight, sans-serif',
                      fontSize: 16,
                      lineHeight: 1.8,
                      color: '#2B1F17',
                      // Faint horizontal lines, like a real notebook page
                      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 27.8px, rgba(43, 31, 23, 0.08) 27.8px, rgba(43, 31, 23, 0.08) 28.8px)',
                    }}
                  />
                </div>

                {/* Prev / next page flip controls */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: 18,
                }}>
                  <button
                    onClick={goPrevDay}
                    disabled={!!flipping}
                    className="mono"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(43, 31, 23, 0.2)',
                      color: '#5C4A3E',
                      padding: '10px 18px', borderRadius: 999,
                      cursor: flipping ? 'default' : 'pointer',
                      opacity: flipping ? 0.5 : 1,
                      fontSize: 12,
                    }}
                  >
                    ← previous day
                  </button>
                  <button
                    onClick={() => flipTo(todayStr(), todayStr() > activeDate ? 'forward' : 'back')}
                    disabled={!!flipping || activeDate === todayStr()}
                    className="mono"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8A7668',
                      cursor: (flipping || activeDate === todayStr()) ? 'default' : 'pointer',
                      opacity: (flipping || activeDate === todayStr()) ? 0.4 : 1,
                      fontSize: 12,
                    }}
                  >
                    today
                  </button>
                  <button
                    onClick={goNextDay}
                    disabled={!!flipping}
                    className="mono"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(43, 31, 23, 0.2)',
                      color: '#5C4A3E',
                      padding: '10px 18px', borderRadius: 999,
                      cursor: flipping ? 'default' : 'pointer',
                      opacity: flipping ? 0.5 : 1,
                      fontSize: 12,
                    }}
                  >
                    next day →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============== TOC VIEW: list of dated entries ============== */}
          {view === 'toc' && activeNotebook && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                marginBottom: 24,
              }}>
                <button
                  onClick={() => setView('open')}
                  className="mono"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#8A7668', padding: '6px 0',
                  }}
                >
                  ← back to page
                </button>
                <h2 className="display" style={{
                  fontSize: 24, fontStyle: 'italic',
                  color: '#2B1F17', fontWeight: 400,
                }}>
                  contents · {activeNotebook.title || 'untitled'}
                </h2>
              </div>

              {populatedEntries.length === 0 ? (
                <p style={{
                  marginTop: 40, fontStyle: 'italic',
                  color: '#8A7668', textAlign: 'center',
                }}>
                  no entries yet. write today's page first.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {populatedEntries.map(e => (
                    <li key={e.id} style={{
                      borderBottom: '1px solid rgba(43, 31, 23, 0.08)',
                    }}>
                      <button
                        onClick={() => {
                          // Pick a flip direction based on which way the date is moving
                          const dir = e.entry_date < activeDate ? 'back' : 'forward';
                          setView('open');
                          // Defer the flip a tick so the open view mounts first
                          setTimeout(() => flipTo(e.entry_date, dir), 20);
                        }}
                        style={{
                          width: '100%', textAlign: 'left',
                          background: 'transparent', border: 'none',
                          padding: '18px 14px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', gap: 6,
                          transition: 'background 150ms',
                        }}
                        onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(242, 99, 58, 0.04)'}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span className="display" style={{
                            fontSize: 17, fontStyle: 'italic', color: '#2B1F17',
                          }}>
                            {formatLong(e.entry_date)}
                          </span>
                          <span className="mono" style={{ fontSize: 11, color: '#8A7668' }}>
                            {(e.content || '').length} chars
                          </span>
                        </div>
                        <p style={{
                          fontSize: 14, color: '#5C4A3E',
                          lineHeight: 1.5,
                          // Show first ~140 chars as a preview
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {(e.content || '').slice(0, 200)}
                          {(e.content || '').length > 200 ? '…' : ''}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Page-flip animation keyframes (scoped to this page) */}
      <style>{`
        .notebook-page {
          transition: none;
        }
        .notebook-page.flipping-forward {
          animation: notebook-flip-fwd 500ms ease-in-out;
        }
        .notebook-page.flipping-back {
          animation: notebook-flip-back 500ms ease-in-out;
        }
        @keyframes notebook-flip-fwd {
          0%   { transform: rotateY(0deg);    opacity: 1; }
          50%  { transform: rotateY(-90deg);  opacity: 0; }
          100% { transform: rotateY(0deg);    opacity: 1; }
        }
        @keyframes notebook-flip-back {
          0%   { transform: rotateY(0deg);    opacity: 1; }
          50%  { transform: rotateY(90deg);   opacity: 0; }
          100% { transform: rotateY(0deg);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ---------- Root App ----------
export default function App() {
  const [route, setRoute] = useState('home');
  const { user, loading } = useAuth();

  const navigate = (to) => {
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // After a successful sign-in, leave the login page automatically.
  // Also handles the OAuth round-trip: Google sends the user back to "/",
  // Supabase parses the URL fragment and fires onAuthStateChange,
  // useAuth picks it up, and this effect clears any stale login route.
  useEffect(() => {
    if (user && route === 'login') {
      setRoute('home');
    }
  }, [user, route]);

  // Four interactive panels require an account. If a logged-out visitor
  // clicks one of those panels in the carousel, send them to login.
  const protectedRoutes = ['planner', 'journal', 'workout', 'notecards', 'notebook'];
  useEffect(() => {
    if (!loading && !user && protectedRoutes.includes(route)) {
      setRoute('login');
    }
  }, [user, loading, route]);

  // While we're checking the session on first load, show a quiet placeholder
  // instead of flashing the home page. Keeps it from ever briefly showing
  // logged-out UI to a logged-in user.
  if (loading) {
    return (
      <div className="grain" style={{ minHeight: '100vh' }}>
        <GlobalStyles/>
        <div style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="mono" style={{ color: '#8A7668', animation: 'soft-pulse 2s ease-in-out infinite' }}>
            opening the door…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grain" style={{ minHeight: '100vh' }}>
      <GlobalStyles/>
      <Nav onNav={navigate} current={route} user={user}/>
      {(() => {
        if (route === 'home') return <HomePage onSelect={navigate}/>;
        if (route === 'login') return <LoginPage onNav={navigate}/>;
        // The five interactive panels get their own dedicated pages.
        const panel = PANELS.find(p => p.id === route);
        if (!panel) return <HomePage onSelect={navigate}/>;
        if (route === 'planner') return <PlannerPage panel={panel} onNav={navigate} user={user}/>;
        if (route === 'journal') return <JournalPage panel={panel} onNav={navigate} user={user}/>;
        if (route === 'workout') return <WorkoutPage panel={panel} onNav={navigate} user={user}/>;
        if (route === 'notecards') return <NotecardsPage panel={panel} onNav={navigate} user={user}/>;
        if (route === 'notebook') return <NotebookPage panel={panel} onNav={navigate} user={user}/>;
        return <FeaturePage panelId={route} onNav={navigate}/>;
      })()}
      <Companion currentRoute={route} onNav={navigate}/>
    </div>
  );
}
