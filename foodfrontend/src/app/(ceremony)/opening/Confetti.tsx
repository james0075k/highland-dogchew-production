'use client';

import { useEffect, useRef } from 'react';

/* The five lungta (prayer flag) colours — blue sky, white cloud, red fire,
   green water, yellow earth — which is what actually gets thrown to the wind
   for an auspicious beginning in the Himalaya, plus the brand's gold. Chosen
   over party-foil rainbow because it means something here. */
const PALETTE = ['#1E5FA8', '#F4F1EA', '#B02A1F', '#2E7D4F', '#E8B23A', '#B8976A'];

export interface Origin {
  x: number;
  y: number;
}

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vrot: number;
  phase: number;
  vphase: number;
  color: string;
  streamer: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* Every burst is aimed and sized in units of viewport height, then scaled at
   throw time. A 380px-tall phone and a 1600px monitor therefore see the same
   trajectory — the paper reaches the same fraction of the screen on both. */
const REF_H = 800;

/** When the corner cannons fire, relative to the cut. */
const CANNON_AT = 1900;
/** When pieces start fading, and when the canvas is finally cleared. */
const FADE_AT = 3600;
const END_AT = 5400;

export default function Confetti({
  active,
  origin,
  className,
}: {
  active: boolean;
  origin?: Origin | null;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Read through a ref so a late-arriving origin never restarts the run. */
  const originRef = useRef<Origin | null>(null);
  originRef.current = origin ?? null;

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    /* u scales velocity and gravity together; size scales more gently so paper
       stays legible on a small screen without turning into bedsheets on a
       large one. */
    const u = h / REF_H;
    const size = Math.min(1.25, Math.max(0.72, Math.sqrt(Math.min(w, h) / 620)));
    const density = Math.min(1.35, Math.max(0.55, (w * h) / (900 * 700)));

    const pieces: Piece[] = [];

    const make = (x: number, y: number, vx: number, vy: number): Piece => {
      const streamer = Math.random() < 0.24;
      return {
        x,
        y,
        vx,
        vy,
        w: (streamer ? rand(3, 5) : rand(6, 12)) * size,
        h: (streamer ? rand(18, 34) : rand(8, 15)) * size,
        rot: rand(0, Math.PI * 2),
        vrot: rand(-0.24, 0.24),
        phase: rand(0, Math.PI * 2),
        vphase: rand(0.1, 0.26),
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        streamer,
      };
    };

    /** A cone of paper thrown from (cx, cy) toward `aim` radians, ± `spread`. */
    const burst = (
      cx: number,
      cy: number,
      aim: number,
      spread: number,
      speed: [number, number],
      n: number,
    ) => {
      const count = Math.round(n * density);
      for (let i = 0; i < count; i++) {
        const a = aim + rand(-spread, spread);
        const v = rand(speed[0], speed[1]) * u;
        pieces.push(make(cx, cy, Math.cos(a) * v, Math.sin(a) * v));
      }
    };

    /* The cut itself: the bow gives way and throws paper straight off the
       ribbon line, so the burst reads as coming out of the knot rather than
       from nowhere. Falls back to the middle of the stage if the bow has not
       been measured yet. */
    const o = originRef.current;
    const ox = o ? o.x : w * 0.5;
    const oy = o ? o.y : h * 0.5;
    burst(ox, oy, -Math.PI / 2, 1.15, [8, 17], 54);

    let cannonsFired = false;
    let drift = Math.round(80 * density);
    let driftTimer = 0;

    let raf = 0;
    let last = performance.now();
    const started = last;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 2.6);
      last = now;
      const elapsed = now - started;

      /* Corner cannons, timed to land with the curtain fully parted. Angled up
         and inward from just off the bottom corners, which is where a real pair
         would stand — and it keeps the middle of the screen clear for the
         opening words. */
      if (!cannonsFired && elapsed >= CANNON_AT) {
        cannonsFired = true;
        burst(w * 0.04, h * 1.02, -Math.PI / 2.9, 0.34, [18, 27], 66);
        burst(w * 0.96, h * 1.02, -Math.PI + Math.PI / 2.9, 0.34, [18, 27], 66);
      }

      // A thin fall from above keeps the air busy between the two events.
      driftTimer += dt;
      if (drift > 0 && driftTimer > 3.4) {
        driftTimer = 0;
        for (let i = 0; i < 2 && drift > 0; i++, drift--) {
          pieces.push(
            make(rand(0, w), rand(-50, -10), rand(-1.4, 1.4) * u, rand(1.4, 3.2) * u),
          );
        }
      }

      ctx.clearRect(0, 0, w, h);

      const fade =
        elapsed > FADE_AT ? Math.max(0, 1 - (elapsed - FADE_AT) / (END_AT - FADE_AT)) : 1;

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.vy += 0.2 * u * dt; // gravity
        p.vx *= 0.992; // drag
        p.vy *= 0.995;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        p.phase += p.vphase * dt;

        if (p.y > h + 80 || p.x < -100 || p.x > w + 100) {
          pieces.splice(i, 1);
          continue;
        }

        // Flutter: scaling x by the phase makes each piece read as a thin
        // rectangle tumbling edge-on, not a spinning sticker.
        const flutter = Math.cos(p.phase);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(flutter, 1);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        if (p.streamer) {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          // The face turning away from the light reads a shade darker.
          ctx.globalAlpha = fade * (flutter < 0 ? 0.35 : 0.12);
          ctx.fillStyle = '#000';
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (pieces.length > 0 && elapsed < END_AT) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [active]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
