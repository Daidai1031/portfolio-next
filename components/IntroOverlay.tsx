'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface IntroOverlayProps {
  /** Portrait image to assemble. */
  src: string;
  /** Fires the moment the portrait has settled — page content starts revealing here. */
  onDone: () => void;
}

interface IntroDot {
  tx: number; ty: number;   // target (viewport coords)
  sx: number; sy: number;   // start (scattered across / beyond the viewport)
  dvx: number; dvy: number; // slow drift while the dot waits its turn
  nx: number; ny: number;   // unit normal of the travel path, for the curved swoop
  curve: number;
  r: number;
  brightness: number;
  delay: number;
  dur: number;
}

const FADE_OUT_MS = 420;
/** Held after the last dot lands, before the page takes over. */
const SETTLE_MS = 40;
/** Hard ceiling — if anything goes wrong (image, CORS, layout) the page still reveals. */
const SAFETY_MS = 2400;

/** Gentle glide: barely moves at first, then decelerates into place. */
const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

export default function IntroOverlay({ src, onDone }: IntroOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const doneRef = useRef(false);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.body.style.overflow = '';
    onDone();
    setFading(true);
    setTimeout(() => setGone(true), FADE_OUT_MS + 60);
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const safety = setTimeout(finish, SAFETY_MS);
    let cancelled = false;

    const start = () => {
      // The visible portrait slot — the mobile and desktop copies are the same
      // markup, only one of them has a real box at any breakpoint.
      const target = Array.from(document.querySelectorAll<HTMLElement>('[data-portrait-target]'))
        .map((el) => el.getBoundingClientRect())
        .find((r) => r.width > 2 && r.height > 2);
      if (!target) { finish(); return; }

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => finish();
      img.onload = () => {
        if (cancelled) return;
        const cw = Math.round(target.width);
        const ch = Math.round(target.height);

        // Match DotMatrixPortrait's params at each breakpoint so the handoff is invisible.
        const isDesktop = window.innerWidth >= 1024;
        const resolution = isDesktop ? 8 : 6;
        const dotRadius = isDesktop ? 3 : 2.5;

        // Same cover-crop sampling as DotMatrixPortrait.
        const off = document.createElement('canvas');
        off.width = cw; off.height = ch;
        const octx = off.getContext('2d');
        if (!octx) { finish(); return; }
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cw / ch;
        let sw: number, sh: number, sx: number, sy: number;
        if (imgRatio > canvasRatio) { sh = img.naturalHeight; sw = sh * canvasRatio; sx = (img.naturalWidth - sw) / 2; sy = 0; }
        else { sw = img.naturalWidth; sh = sw / canvasRatio; sx = 0; sy = (img.naturalHeight - sh) / 2; }
        octx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);

        let pixels: Uint8ClampedArray;
        try { pixels = octx.getImageData(0, 0, cw, ch).data; } catch { finish(); return; }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const spread = Math.max(vw, vh);
        const cx = cw / 2, cy = ch / 2;
        const maxRadial = Math.hypot(cx, cy) || 1;
        const dots: IntroDot[] = [];
        const gap = resolution;
        const halfGap = gap / 2;

        for (let y = halfGap; y < ch; y += gap) {
          for (let x = halfGap; x < cw; x += gap) {
            const i = (Math.round(y) * cw + Math.round(x)) * 4;
            const a = pixels[i + 3];
            if (a < 30) continue;
            const brightness = (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]) / 255;
            const r = dotRadius * (1 - brightness * 0.75);
            if (r < 0.3) continue;

            const tx = target.left + x;
            const ty = target.top + y;
            // Scatter across the whole screen and past its edges, from every direction.
            const angle = Math.random() * Math.PI * 2;
            const dist = (0.22 + Math.random() * 0.95) * spread;
            const sxo = tx + Math.cos(angle) * dist;
            const syo = ty + Math.sin(angle) * dist;
            const vxp = sxo - tx, vyp = syo - ty;
            const travel = Math.hypot(vxp, vyp) || 1;
            const driftAngle = Math.random() * Math.PI * 2;
            const driftSpeed = 25 + Math.random() * 45; // px/s, keeps the waiting field alive
            // The face gathers from the middle outward; longer journeys take longer.
            const radial = Math.hypot(x - cx, y - cy) / maxRadial;

            dots.push({
              tx, ty, sx: sxo, sy: syo,
              dvx: Math.cos(driftAngle) * driftSpeed,
              dvy: Math.sin(driftAngle) * driftSpeed,
              nx: -vyp / travel, ny: vxp / travel,
              curve: (Math.random() - 0.5) * 90 * (0.4 + travel / spread),
              r, brightness,
              delay: radial * 200 + Math.random() * 160,
              dur: 760 + (travel / spread) * 280,
            });
          }
        }
        if (!dots.length) { finish(); return; }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = vw * dpr; canvas.height = vh * dpr;
        canvas.style.width = `${vw}px`; canvas.style.height = `${vh}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) { finish(); return; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const total = dots.reduce((m, d) => Math.max(m, d.delay + d.dur), 0);
        const t0 = performance.now();

        const frame = (now: number) => {
          const t = now - t0;
          ctx.clearRect(0, 0, vw, vh);
          const fadeIn = Math.min(1, t / 320);

          for (let i = 0; i < dots.length; i++) {
            const d = dots[i];
            const p = Math.min(1, Math.max(0, (t - d.delay) / d.dur));
            const e = easeInOutCubic(p);

            // Drift in place until this dot's turn, then glide in along a soft arc.
            const driftT = Math.min(t, d.delay) / 1000;
            const ox = d.sx + d.dvx * driftT;
            const oy = d.sy + d.dvy * driftT;
            const bow = Math.sin(p * Math.PI) * d.curve;
            const x = ox + (d.tx - ox) * e + d.nx * bow;
            const y = oy + (d.ty - oy) * e + d.ny * bow;

            // Trailing dots run warm and faint, then settle into the portrait's grey.
            const heat = (1 - e) * (1 - e);
            const grey = Math.round(d.brightness * 60);
            const rCh = Math.round(grey + heat * (249 - grey));
            const gCh = Math.round(grey + heat * (115 - grey));
            const bCh = Math.round(grey + heat * (22 - grey));
            const alpha = (0.35 + (1 - d.brightness) * 0.65) * fadeIn * (0.32 + 0.68 * e);

            ctx.beginPath();
            ctx.arc(x, y, d.r * (1.7 - 0.7 * e), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rCh},${gCh},${bCh},${alpha})`;
            ctx.fill();
          }

          if (t < total + SETTLE_MS) rafRef.current = requestAnimationFrame(frame);
          else finish();
        };
        clearTimeout(safety);
        rafRef.current = requestAnimationFrame(frame);
      };
      img.src = src;
    };

    // Let layout settle (and the scroll reset apply) before measuring the slot.
    const kick = requestAnimationFrame(() => requestAnimationFrame(start));

    return () => {
      cancelled = true;
      clearTimeout(safety);
      cancelAnimationFrame(kick);
      cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = '';
    };
  }, [src, finish]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] bg-white pointer-events-none"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-out`,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
