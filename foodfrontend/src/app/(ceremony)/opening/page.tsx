'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './opening.module.css';
import Confetti, { type Origin } from './Confetti';

/* ═══════════════════════════════════════════════════════════════════════════
   Opening ceremony

   One gesture drives everything: drag the scissors along the silk until the
   blades reach the bow. The cut releases the ribbon, the curtain parts, the
   air fills, and the shop is behind it.
   ═══════════════════════════════════════════════════════════════════════════ */

type Phase = 'idle' | 'cutting' | 'cut' | 'opening' | 'revealed';

const TRACK_START = 12; // where the blades rest, as % of track width
const TRACK_END = 50; // the bow, dead centre

/* Beat sheet, in ms from the cut. The whole cut — pulse, threads, both ends
   swung out and settled — is done by 1.18s; the curtains take over from there. */
const T_OPEN = 820; // curtains start to part
const T_REVEAL = 2100; // the shop is visible
const T_ENTER = 5100; // three seconds to read, then in you go
const COUNTDOWN = Math.round((T_ENTER - T_REVEAL) / 1000);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* Resistance, then give.

   Past 70% of the travel the blades meet the silk, and the last of the drag
   costs about twice the hand movement — you feel the ribbon push back. The cut
   still fires off the raw pointer position, so the moment it goes the blades
   snap the withheld distance closed at once. */
const RESIST_FROM = 0.7;
const RESIST = 0.5;
const resisted = (p: number) =>
  p <= RESIST_FROM ? p : RESIST_FROM + (p - RESIST_FROM) * RESIST;

/* The same weight, for a tap or a keypress: quick approach, a grind through the
   fibres, then the snap. */
function driveEase(k: number) {
  if (k < 0.5) return 0.62 * (1 - (1 - k / 0.5) ** 2);
  if (k < 0.86) return 0.62 + 0.2 * ((k - 0.5) / 0.36);
  return 0.82 + 0.18 * ((k - 0.86) / 0.14) ** 0.5;
}

/* Fixed positions — random values would differ between server and client
   render and trip a hydration mismatch. */
const STARS = [
  [8, 9], [17, 21], [27, 6], [34, 16], [43, 11], [52, 5],
  [61, 18], [69, 9], [78, 22], [86, 13], [93, 7], [22, 31],
  [48, 27], [74, 33], [12, 38], [88, 30],
];

/* Pleats, measured rather than repeated: a real curtain has no two folds the
   same width, and the crest of each fold catches the light at a slightly
   different place. `grow` is the flex share, `crest` the highlight position. */
const PLEATS = [
  { grow: 1.18, crest: 46 },
  { grow: 0.84, crest: 53 },
  { grow: 1.36, crest: 41 },
  { grow: 0.97, crest: 56 },
  { grow: 1.24, crest: 44 },
  { grow: 0.72, crest: 59 },
  { grow: 1.42, crest: 39 },
  { grow: 0.9, crest: 52 },
  { grow: 1.12, crest: 47 },
  { grow: 0.79, crest: 58 },
  { grow: 1.31, crest: 42 },
  { grow: 0.94, crest: 51 },
  { grow: 1.2, crest: 45 },
  { grow: 0.86, crest: 55 },
];

/* ── Sound ─────────────────────────────────────────────────────────────────
   Synthesised rather than loaded: two short cues, no network request, and
   the first one is triggered by the user's own gesture so autoplay policy
   is never in question. */
function useCeremonySound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  /** The snip: a filtered noise burst, the sound of blades meeting. */
  const snip = useCallback(() => {
    if (!enabled) return;
    const ac = ctx();
    if (!ac) return;
    const t = ac.currentTime;

    const len = Math.floor(ac.sampleRate * 0.09);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;

    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200;
    bp.Q.value = 3.5;

    const g = ac.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

    src.connect(bp).connect(g).connect(ac.destination);
    src.start(t);
    src.stop(t + 0.12);
  }, [ctx, enabled]);

  /** The bowl: a struck singing-bowl tone under the curtain reveal. */
  const bowl = useCallback(() => {
    if (!enabled) return;
    const ac = ctx();
    if (!ac) return;
    const t = ac.currentTime;

    const master = ac.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.32, t + 0.05);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    master.connect(ac.destination);

    [196, 392.6, 588, 785.4].forEach((f, i) => {
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ac.createGain();
      g.gain.value = 1 / (i + 1.6);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 3.5);
    });
  }, [ctx, enabled]);

  useEffect(() => () => void ctxRef.current?.close(), []);

  return { snip, bowl };
}

/* ── The silk ──────────────────────────────────────────────────────────────
   Each half is a band with real thickness that sags from the edge of the
   frame down to the bow, the way a ribbon strung across a doorway actually
   hangs. Drawn with preserveAspectRatio="none" so the span stretches to any
   width — a horizontal band is the one shape that tolerates it invisibly.

   The SVG has to live inside a positioned <div>: an <svg> is a replaced
   element, so given `left`, `right` and a fixed height it discards `right`
   and takes its width from the intrinsic ratio instead — which is what left
   the two halves short of the centre.

   Geometry is fixed to the 600 × 96 box. The band is 30 units thick; its
   centreline runs from y = 18 at the frame edge to y = 48 — dead centre —
   where the halves meet. Both numbers are load-bearing: the bow and the
   blades are aligned to them. */
const BAND = 30;
const SAG_FRACTION = BAND / 96; // 30 units of droop over a 96-unit box

const CENTRELINE = {
  left: 'M0 18 C170 23 390 39 600 48',
  right: 'M600 18 C430 23 210 39 0 48',
};

const OUTLINE = {
  left: 'M0 3 C170 8 390 24 600 33 L600 63 C390 54 170 38 0 33 Z',
  right: 'M600 3 C430 8 210 24 0 33 L0 63 C210 54 430 38 600 33 Z',
};

/* The cut end is torn, not sliced: the clip that squares off the inner end
   in one piece becomes a run of ragged notches in the other. */
const EDGE = {
  left: {
    whole: 'M0 0 L600 0 L600 96 L0 96 Z',
    torn:
      'M0 0 L600 0 L600 26 L590 31 L600 36 L588 41 L598 46 L587 51 L597 56 ' +
      'L589 61 L600 66 L600 96 L0 96 Z',
  },
  right: {
    whole: 'M600 0 L0 0 L0 96 L600 96 Z',
    torn:
      'M600 0 L0 0 L0 26 L10 31 L0 36 L12 41 L2 46 L13 51 L3 56 ' +
      'L11 61 L0 66 L0 96 L600 96 Z',
  },
};

/* Satin, built as a stack of strokes rather than one gradient fill.

   A gradient across a curved band is the problem: SVG maps it to the bounding
   box, so on a sloped path the ramp smears along the length instead of across
   the width. Stroking the same centreline repeatedly — each pass narrower and
   nudged up a little — puts the ramp exactly perpendicular to the ribbon at
   every point along the droop. Dark edge, sheen, cream specular high of centre,
   dark edge, following the curve. */
const SATIN: Array<[width: number, dy: number, color: string]> = [
  [30, 0, '#6B5330'],
  [28, -0.5, '#8A6F3F'],
  [24.5, -1.4, '#A2854A'],
  [21, -2.2, '#B99656'],
  [17.5, -3, '#C6A361'],
  [14, -3.6, '#D8B776'],
  [10.5, -4.1, '#E8CE8F'],
  [7, -4.4, '#EFDDAF'],
  [3.6, -4.6, '#F5EBD7'],
  // The underside, where the cloth turns away from the light.
  [4.5, 12.2, 'rgba(10,9,8,0.34)'],
  // Selvedges: the folded edges the weave is finished with.
  [1.5, -14.3, 'rgba(245,235,215,0.55)'],
  [1.4, 14.3, 'rgba(10,9,8,0.5)'],
];

function SilkHalf({ side, torn }: { side: 'left' | 'right'; torn: boolean }) {
  const bandId = `band-${side}`;
  const edgeId = `edge-${side}`;

  return (
    <div
      className={`${s.silk} ${side === 'left' ? s.silkLeft : s.silkRight}`}
      aria-hidden="true"
    >
      <svg
        className={s.silkSvg}
        viewBox="0 0 600 96"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <clipPath id={bandId}>
            <path d={OUTLINE[side]} />
          </clipPath>
          <clipPath id={edgeId}>
            <path d={torn ? EDGE[side].torn : EDGE[side].whole} />
          </clipPath>

          {/* Creases: soft light and shade running across the weave. */}
          <linearGradient id={`crease-${side}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0A0908" stopOpacity="0.22" />
            <stop offset="26%" stopColor="#0A0908" stopOpacity="0" />
            <stop offset="52%" stopColor="#F5EBD7" stopOpacity="0.16" />
            <stop offset="78%" stopColor="#0A0908" stopOpacity="0" />
            <stop offset="100%" stopColor="#0A0908" stopOpacity="0.22" />
          </linearGradient>
          <pattern
            id={`weave-${side}`}
            width="64"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <rect width="64" height="96" fill={`url(#crease-${side})`} />
          </pattern>

          {/* The travelling sheen. */}
          <linearGradient id={`sheen-${side}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F5EBD7" stopOpacity="0" />
            <stop offset="46%" stopColor="#F5EBD7" stopOpacity="0.42" />
            <stop offset="56%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F5EBD7" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${edgeId})`}>
          {SATIN.map(([width, dy, color], i) => (
            <path
              key={i}
              d={CENTRELINE[side]}
              fill="none"
              stroke={color}
              strokeWidth={width}
              transform={`translate(0 ${dy})`}
            />
          ))}

          <g clipPath={`url(#${bandId})`}>
            <rect x="0" y="0" width="600" height="96" fill={`url(#weave-${side})`} />
            <g className={s.sheen}>
              <rect
                x="-230"
                y="-40"
                width="150"
                height="180"
                fill={`url(#sheen-${side})`}
                transform="skewX(-16)"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

/* Threads springing from the cut. Fixed values, because a random one would
   differ between the server and client render. */
const THREADS = [
  { deg: -118, dist: 62, spin: -170, dur: 380, delay: 0 },
  { deg: -74, dist: 80, spin: 120, dur: 420, delay: 20 },
  { deg: -38, dist: 58, spin: -90, dur: 360, delay: 45 },
  { deg: -142, dist: 54, spin: 150, dur: 400, delay: 30 },
  { deg: -8, dist: 46, spin: -60, dur: 340, delay: 60 },
];

function Threads() {
  return (
    <div className={s.threads} aria-hidden="true">
      {THREADS.map((t, i) => {
        const rad = (t.deg * Math.PI) / 180;
        return (
          <span
            key={i}
            className={s.thread}
            style={
              {
                '--tx': `${(Math.cos(rad) * t.dist).toFixed(1)}px`,
                '--ty': `${(Math.sin(rad) * t.dist).toFixed(1)}px`,
                '--spin': `${t.spin}deg`,
                '--dur': `${t.dur}ms`,
                '--delay': `${t.delay}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/* ── The bow ───────────────────────────────────────────────────────────────
   Two loops, a knot, and two tails finished with the swallowtail notch a
   ribbon end is always cut with. Uniformly scaled, unlike the silk, because
   a stretched bow reads as a mistake immediately.

   The knot sits at y = 80 of the 210-unit box — 38% down — which is what
   the CSS uses to drop it onto the ribbon line. */
const BOW_KNOT_Y = 38; // %

function Bow() {
  return (
    <svg className={s.bowArt} viewBox="0 0 240 210" aria-hidden="true">
      <defs>
        <linearGradient id="bowFace" x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#fbf0cf" />
          <stop offset="26%" stopColor="#dfc086" />
          <stop offset="62%" stopColor="#b8976a" />
          <stop offset="100%" stopColor="#7a5a2e" />
        </linearGradient>
        <linearGradient id="bowUnder" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#8f6f3f" />
          <stop offset="55%" stopColor="#6d5028" />
          <stop offset="100%" stopColor="#442f14" />
        </linearGradient>
        <linearGradient id="bowKnot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6e6bd" />
          <stop offset="42%" stopColor="#c9a76f" />
          <stop offset="100%" stopColor="#6b4d24" />
        </linearGradient>
        <radialGradient id="loopShade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="45%" stopColor="#000" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Tails first — they pass behind the loops and the knot. */}
      <g>
        <path
          d="M112 81 C108 112 100 138 67 171 L86 161 L93 181 C106 152 118 118 124 87 Z"
          fill="url(#bowUnder)"
        />
        <path
          d="M128 81 C132 112 140 138 173 171 L154 161 L147 181 C134 152 122 118 116 87 Z"
          fill="url(#bowFace)"
        />
        {/* The curl where each tail turns over on itself. */}
        <path
          d="M112 81 C108 112 100 138 67 171 L74 168 C102 137 110 110 116 84 Z"
          fill="rgba(255,244,214,0.28)"
        />
      </g>

      {/* Loops. */}
      <g>
        <path
          d="M118 72 C94 34 40 26 20 50 C2 72 26 100 66 94 C90 90 110 84 122 88 Z"
          fill="url(#bowFace)"
        />
        <path
          d="M118 72 C94 34 40 26 20 50 C2 72 26 100 66 94 C90 90 110 84 122 88 Z"
          fill="url(#loopShade)"
        />
        <path
          d="M122 72 C146 34 200 26 220 50 C238 72 214 100 174 94 C150 90 130 84 118 88 Z"
          fill="url(#bowFace)"
        />
        <path
          d="M122 72 C146 34 200 26 220 50 C238 72 214 100 174 94 C150 90 130 84 118 88 Z"
          fill="url(#loopShade)"
        />
        {/* Where each loop folds into the knot the cloth turns to its back. */}
        <path d="M118 72 C104 76 100 88 108 94 C114 92 118 90 122 88 Z" fill="url(#bowUnder)" />
        <path d="M122 72 C136 76 140 88 132 94 C126 92 122 90 118 88 Z" fill="url(#bowUnder)" />
      </g>

      {/* Knot. */}
      <path
        d="M106 66 C122 62 130 62 136 68 C142 76 141 88 134 95 C124 100 112 100 105 94 C99 87 99 72 106 66 Z"
        fill="url(#bowKnot)"
      />
      <path
        d="M108 68 C118 65 126 65 131 69"
        fill="none"
        stroke="rgba(255,246,220,0.6)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Scissors ──────────────────────────────────────────────────────────────
   Ceremonial shears: polished steel blades, gilded ring handles. The steel is
   what makes them legible — gold blades vanished against the gold silk.

   Both arms are drawn identically along a horizontal centreline and then
   counter-rotated about the pivot, so `close` 0 → 1 shuts them exactly the way
   a real pair closes as you pull toward the bow. */
const PIVOT_X = 70;
const PIVOT_Y = 46;
const OPEN_ANGLE = 22;

/* The blades hold open for most of the travel and shut in the last stretch, so
   the closing reads as the cut rather than as a slow squeeze across the whole
   drag. */
const BLADE_FROM = 0.6;
const bladeClose = (p: number) => clamp((p - BLADE_FROM) / (1 - BLADE_FROM), 0, 1);

function ScissorArm() {
  return (
    <>
      <circle cx="26" cy="46" r="12.5" fill="none" stroke="url(#gilt)" strokeWidth="6" />
      <path d="M36 41 L53 41.5 L53 50.5 L36 51 Z" fill="url(#gilt)" />
      <path
        d="M50 40 L138 44.6 L138 47.4 L50 52 Z"
        fill="url(#steel)"
        stroke="rgba(38,26,10,0.55)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </>
  );
}

function Scissors({ close }: { close: number }) {
  const a = OPEN_ANGLE * (1 - close);
  return (
    <svg viewBox="0 0 152 92" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="38%" stopColor="#D2D7DC" />
          <stop offset="72%" stopColor="#8B9299" />
          <stop offset="100%" stopColor="#5A6068" />
        </linearGradient>
        <linearGradient id="gilt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3DFB0" />
          <stop offset="50%" stopColor="#C9A76F" />
          <stop offset="100%" stopColor="#8B6C3E" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${-a} ${PIVOT_X} ${PIVOT_Y})`}>
        <ScissorArm />
      </g>
      <g transform={`rotate(${a} ${PIVOT_X} ${PIVOT_Y})`}>
        <ScissorArm />
      </g>
      <circle cx={PIVOT_X} cy={PIVOT_Y} r="4.6" fill="#2E2113" />
      <circle cx={PIVOT_X} cy={PIVOT_Y} r="1.9" fill="#C9A76F" />
    </svg>
  );
}

function Curtain({ side }: { side: 'left' | 'right' }) {
  const folds = side === 'left' ? PLEATS : [...PLEATS].reverse();
  return (
    <div
      className={`${s.curtain} ${side === 'left' ? s.curtainLeft : s.curtainRight}`}
      aria-hidden="true"
    >
      <div className={s.pleats}>
        {folds.map((f, i) => (
          <span
            key={i}
            className={s.pleat}
            style={
              {
                flexGrow: f.grow,
                '--crest': f.crest,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <span className={s.drape} />
      <span className={s.hem} />
    </div>
  );
}

export default function OpeningCeremony() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sound, setSound] = useState(true);
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const [burstFrom, setBurstFrom] = useState<Origin | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const bowRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef(0);
  const movedRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');

  const { snip, bowl } = useCeremonySound(sound);

  phaseRef.current = phase;

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    router.prefetch('/');
    const t = timers.current;
    return () => {
      t.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [router]);

  /* Once the shop is visible, say plainly how long is left. */
  useEffect(() => {
    if (phase !== 'revealed') return;
    setCountdown(COUNTDOWN);
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  /* ── The cut, and everything it sets off ──────────────────────────────── */
  const cut = useCallback(() => {
    if (
      phaseRef.current === 'cut' ||
      phaseRef.current === 'opening' ||
      phaseRef.current === 'revealed'
    ) {
      return;
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Throw the confetti from the knot itself, wherever it happens to be on
    // this screen, rather than from a guessed point.
    const r = bowRef.current?.getBoundingClientRect();
    if (r) setBurstFrom({ x: r.left + r.width / 2, y: r.top + r.height * (BOW_KNOT_Y / 100) });

    setProgress(1);
    setPhase('cut');
    setDragging(false);
    snip();
    navigator.vibrate?.([14, 40, 22]);

    if (reduced) {
      setPhase('revealed');
      after(T_ENTER - T_REVEAL, () => router.push('/'));
      return;
    }

    after(T_OPEN, () => {
      setPhase('opening');
      bowl();
    });
    after(T_REVEAL, () => setPhase('revealed'));
    after(T_ENTER, () => router.push('/'));
  }, [after, bowl, router, snip]);

  /* ── Pointer drag ─────────────────────────────────────────────────────── */
  const progressFromX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const from = r.left + (r.width * TRACK_START) / 100;
    const to = r.left + (r.width * TRACK_END) / 100;
    if (to === from) return 0;
    return clamp((clientX - from) / (to - from), 0, 1);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== 'idle' && phase !== 'cutting') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    movedRef.current = 0;
    setDragging(true);
    setPhase('cutting');
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    movedRef.current += Math.abs(e.movementX || 0);
    const raw = progressFromX(e.clientX);
    setProgress(resisted(raw));
    if (raw >= 0.985) cut();
  };

  /** Animate the blades home — used for a tap, a keypress, or a released drag
      that already got most of the way there. */
  const glide = useCallback(
    (from: number, ms: number) => {
      const t0 = performance.now();
      const step = (now: number) => {
        const k = clamp((now - t0) / ms, 0, 1);
        setProgress(from + (1 - from) * driveEase(k));
        if (k < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          cut();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [cut],
  );

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);

    if (phaseRef.current !== 'cutting') return;

    // A tap, not a drag — carry it the rest of the way rather than punishing
    // someone who didn't realise it was draggable.
    if (movedRef.current < 6) {
      setPhase('cutting');
      glide(progress, 820);
      return;
    }

    // Resistance caps the shown progress below 1, so the release threshold is
    // measured against what the blades can actually reach.
    if (progress > resisted(0.78)) {
      glide(progress, 300);
      return;
    }

    setProgress(0);
    setPhase('idle');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (phase !== 'idle') return;
    setPhase('cutting');
    glide(0, 820);
  };

  const pos = TRACK_START + progress * (TRACK_END - TRACK_START);

  /* Ride the drape: the blades sit lower as they near the bow, because that is
     where the ribbon hangs lowest. Mirrors the bezier in SilkHalf. */
  const alongSpan = clamp(pos / TRACK_END, 0, 1);
  const sagK = -SAG_FRACTION * (1 - alongSpan ** 1.35);

  const severed = phase === 'cut' || phase === 'opening' || phase === 'revealed';
  const stageClass = [s.stage, s[phase]].filter(Boolean).join(' ');

  return (
    <main className={stageClass}>
      {/* ── Behind the curtain: dawn over the Himalaya ──────────────────── */}
      <div className={s.dawn} aria-hidden="true">
        {STARS.map(([x, y]) => (
          <span key={`${x}-${y}`} className={s.star} style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        <div className={s.sun} />
        <svg
          className={s.ridges}
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 300 L120 206 L204 252 L318 148 L420 224 L540 118 L660 202 L782 140 L900 212 L1020 158 L1140 232 L1262 178 L1380 242 L1440 208 L1440 400 L0 400 Z"
            fill="#3E4A6B"
            opacity="0.55"
          />
          <path
            d="M0 342 L104 280 L222 322 L340 238 L462 300 L580 248 L700 312 L820 258 L940 322 L1060 268 L1180 330 L1300 278 L1440 330 L1440 400 L0 400 Z"
            fill="#26304B"
            opacity="0.85"
          />
          <path
            d="M0 380 L160 330 L300 372 L440 320 L580 366 L720 324 L860 370 L1000 330 L1140 372 L1280 334 L1440 376 L1440 400 L0 400 Z"
            fill="#131A2B"
          />
        </svg>
      </div>

      {/* ── Reveal ──────────────────────────────────────────────────────── */}
      <div className={s.revealBody}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo11.png" alt="" className={s.mark} />
        <h2 className={s.revealTitle}>We&rsquo;re open</h2>
        <p className={s.revealNote}>
          Hard cheese chews from the high Himalaya, made the way herders have made
          them for centuries. Come in and have a look around.
        </p>
        <button type="button" className={s.enter} onClick={() => router.push('/')}>
          Shop now
        </button>
        <p className={s.autoNote}>
          {countdown > 0 ? `Opening the shop in ${countdown}` : 'Opening the shop'}
        </p>
      </div>

      <Confetti active={phase !== 'idle' && phase !== 'cutting'} origin={burstFrom} className={s.confetti} />

      {/* ── Curtains ──────────────────────────────────────────────────────
          Right first: the two overlap in the middle, and the left has to lap
          over it. DOM order does that without a z-index that would also lift
          it above the ceremony. */}
      <Curtain side="right" />
      <Curtain side="left" />

      {/* ── The ceremony, staged on the curtain ─────────────────────────── */}
      <div className={s.front}>
        <div className={s.head}>
          <p className={s.eyebrow}>Est. 2026</p>
          <h1 className={s.title}>Highland Yak Chew</h1>
          <p className={s.subtitle}>Opening day</p>
        </div>

        <div className={s.ribbonZone}>
          <div className={s.track} ref={trackRef}>
            <SilkHalf side="left" torn={severed} />
            <SilkHalf side="right" torn={severed} />

            <div className={s.bow} ref={bowRef} aria-hidden="true">
              <Bow />
            </div>

            {severed && <Threads />}

            <button
              type="button"
              className={`${s.scissors} ${dragging ? s.scissorsDragging : ''}`}
              style={{ left: `${pos}%`, '--sag-k': sagK } as React.CSSProperties}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              aria-label="Cut the ribbon. Drag toward the centre, or press Enter."
            >
              <Scissors close={bladeClose(progress)} />
            </button>
          </div>
        </div>

        <p className={s.hint}>
          Drag the scissors to cut the ribbon
          <span className={s.nudge} aria-hidden="true">
            →
          </span>
        </p>
      </div>

      {/* ── Pelmet: what the curtains hang from ─────────────────────────── */}
      <div className={s.pelmet} aria-hidden="true">
        <span className={s.pelmetFringe} />
      </div>

      {/* ── Chrome ──────────────────────────────────────────────────────── */}
      <div className={s.chrome}>
        <button type="button" className={s.ghost} onClick={() => router.push('/')}>
          Skip
        </button>
        <button
          type="button"
          className={s.ghost}
          onClick={() => setSound((v) => !v)}
          aria-pressed={sound}
        >
          Sound {sound ? 'on' : 'off'}
        </button>
      </div>

      <p className={s.srOnly} role="status" aria-live="polite">
        {phase === 'revealed'
          ? 'The ribbon is cut and the shop is open. Taking you to the home page.'
          : ''}
      </p>
    </main>
  );
}
