'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { readBrandOrange } from '@/lib/brand-color';

interface DotMatrixPortraitProps {
  src: string; alt?: string; resolution?: number; dotRadius?: number;
  influenceRadius?: number; displaceStrength?: number; className?: string;
  paused?: boolean; mirrored?: boolean;
}
interface Dot {
  ox: number; oy: number; x: number; y: number; r: number; brightness: number;
  distFromCenter: number;
}

export default function DotMatrixPortrait({
  src, alt = '', resolution = 8, dotRadius = 3,
  influenceRadius = 80, displaceStrength = 18, className = '', paused = false,
  mirrored = false,
}: DotMatrixPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const scrollRef = useRef({ velocity: 0, lastY: 0, lastTime: 0, rippleTime: 0 });
  const rafRef = useRef(0);
  const visibleRef = useRef(false);
  const reducedRef = useRef(false);
  const pausedRef = useRef(paused);
  const restartRef = useRef<() => void>(() => undefined);
  const orangeRef = useRef<[number, number, number]>([0, 0, 0]);
  const [ready, setReady] = useState(false);

  const buildDots = useCallback((img: HTMLImageElement, cw: number, ch: number) => {
    if (!cw || !ch || cw < 2 || ch < 2) { dotsRef.current = []; return; }
    const offscreen = document.createElement('canvas');
    offscreen.width = cw; offscreen.height = ch;
    const octx = offscreen.getContext('2d');
    if (!octx) return;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;
    let sw: number, sh: number, sx: number, sy: number;
    if (imgRatio > canvasRatio) { sh = img.naturalHeight; sw = sh * canvasRatio; sx = (img.naturalWidth - sw) / 2; sy = 0; }
    else { sw = img.naturalWidth; sh = sw / canvasRatio; sx = 0; sy = (img.naturalHeight - sh) / 2; }
    if (mirrored) {
      octx.save();
      octx.translate(cw, 0);
      octx.scale(-1, 1);
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      octx.restore();
    } else {
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }
    let pixels: Uint8ClampedArray;
    try { pixels = octx.getImageData(0, 0, cw, ch).data; } catch { dotsRef.current = []; return; }
    const dots: Dot[] = [];
    const gap = resolution; const halfGap = gap / 2;
    const centerX = cw / 2; const centerY = ch / 2;
    for (let y = halfGap; y < ch; y += gap) {
      for (let x = halfGap; x < cw; x += gap) {
        const px = Math.round(x); const py = Math.round(y);
        const i = (py * cw + px) * 4;
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2], a = pixels[i+3];
        if (a < 30) continue;
        const brightness = (0.299*r + 0.587*g + 0.114*b) / 255;
        const radius = dotRadius * (1 - brightness * 0.75);
        if (radius < 0.3) continue;
        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        dots.push({ ox: x, oy: y, x, y, r: radius, brightness, distFromCenter });
      }
    }
    dotsRef.current = dots;
  }, [resolution, dotRadius, mirrored]);

  const animate = useCallback(function draw() {
    rafRef.current = 0;
    if (!visibleRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const mouse = mouseRef.current;
    const scroll = scrollRef.current;
    const dots = dotsRef.current;
    const ir = influenceRadius; const ir2 = ir * ir; const ease = 0.12;
    const now = performance.now();

    scroll.velocity *= 0.96;
    const absVel = Math.abs(scroll.velocity);
    if (absVel > 0.3) scroll.rippleTime = now;
    const rippleFade = reducedRef.current ? 0 : Math.max(0, 1 - (now - scroll.rippleTime) / 800);

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      let tx = dot.ox; let ty = dot.oy;

      const dx = dot.ox - mouse.x; const dy = dot.oy - mouse.y;
      const dist2 = dx * dx + dy * dy;

      // Pointer displacement + orange tint
      if (mouse.active && dist2 < ir2) {
        const dist = Math.sqrt(dist2); const force = 1 - dist / ir;
        const angle = Math.atan2(dy, dx);
        tx = dot.ox + Math.cos(angle) * force * displaceStrength;
        ty = dot.oy + Math.sin(angle) * force * displaceStrength;
      }

      // Scroll ripple (mobile)
      let rippleScale = 1;
      if (rippleFade > 0.01) {
        const waveSpeed = 0.15;
        const elapsed = now - scroll.rippleTime + 500;
        const wavePos = elapsed * waveSpeed;
        const distFromWave = Math.abs(dot.distFromCenter - (wavePos % (dot.distFromCenter + 400)));
        const waveInfluence = Math.max(0, 1 - distFromWave / 100);
        const rippleAmount = Math.min(absVel, 12) * waveInfluence * rippleFade;
        const rippleAngle = (dot.distFromCenter * 0.02 + now * 0.003) * (scroll.velocity > 0 ? 1 : -1);
        tx += Math.cos(rippleAngle) * rippleAmount * 0.5;
        ty += Math.sin(rippleAngle) * rippleAmount * 0.7;
        rippleScale = 1 + waveInfluence * rippleFade * Math.min(absVel / 12, 1) * 0.4;
      }

      dot.x += (tx - dot.x) * ease;
      dot.y += (ty - dot.y) * ease;

      // Color
      const dist = Math.sqrt(dist2);
      const orangeMix = mouse.active && dist2 < ir2 ? (1 - dist / ir) * 0.6 : 0;
      const baseGray = Math.round(dot.brightness * 60);
      const rCh = Math.round(baseGray + orangeMix * (orangeRef.current[0] - baseGray));
      const gCh = Math.round(baseGray + orangeMix * (orangeRef.current[1] - baseGray));
      const bCh = Math.round(baseGray + orangeMix * (orangeRef.current[2] - baseGray));
      const alpha = 0.35 + (1 - dot.brightness) * 0.65;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r * rippleScale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rCh},${gCh},${bCh},${alpha})`;
      ctx.fill();
    }
    if (!reducedRef.current && !pausedRef.current) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      visibleRef.current = false;
    }
  }, [influenceRadius, displaceStrength]);

  useEffect(() => {
    const container = containerRef.current; const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const img = new window.Image(); img.crossOrigin = 'anonymous';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedRef.current = motion.matches;
    orangeRef.current = readBrandOrange(container);
    let disposed = false;
    let loaded = false;
    let intersects = false;

    const restart = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      // A paused portrait still renders one final frame. Keeping that bitmap on
      // the canvas lets an ancestor scale it entirely on the compositor.
      visibleRef.current = !disposed && loaded && intersects && !document.hidden && dotsRef.current.length > 0;
      if (visibleRef.current) rafRef.current = requestAnimationFrame(animate);
    };
    restartRef.current = restart;

    const setup = () => {
      if (disposed || !loaded) return;
      // Use the untransformed layout box. getBoundingClientRect() includes the
      // Hero's animated scale and would create an oversized canvas that the
      // portrait container then clips.
      const cw = Math.round(container.clientWidth);
      const ch = Math.round(container.clientHeight);
      if (cw < 2 || ch < 2) { dotsRef.current = []; restart(); return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`; canvas.style.height = `${ch}px`;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots(img, cw, ch); setReady(true);
      restart();
    };

    // Scroll velocity tracking
    const onScroll = () => {
      if (!visibleRef.current || reducedRef.current) return;
      const now = performance.now();
      const currentY = window.scrollY;
      const dt = now - scrollRef.current.lastTime;
      if (dt > 0) {
        scrollRef.current.velocity = (currentY - scrollRef.current.lastY) / Math.max(dt, 1) * 16;
      }
      scrollRef.current.lastY = currentY;
      scrollRef.current.lastTime = now;
    };

    let lastTouchY = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (!visibleRef.current || reducedRef.current) return;
      const touch = e.touches[0]; if (!touch) return;
      const now = performance.now();
      const dy = touch.clientY - lastTouchY;
      const dt = now - scrollRef.current.lastTime;
      if (dt > 0 && lastTouchY !== 0) {
        scrollRef.current.velocity = -dy / Math.max(dt, 1) * 20;
        scrollRef.current.rippleTime = now;
      }
      lastTouchY = touch.clientY;
      scrollRef.current.lastTime = now;
    };
    const onTouchStart = (e: TouchEvent) => {
      if (!visibleRef.current || reducedRef.current) return;
      lastTouchY = e.touches[0]?.clientY ?? 0;
      scrollRef.current.lastTime = performance.now();
    };

    img.onload = () => {
      if (disposed) return;
      loaded = true;
      setup();
    };
    const ro = new ResizeObserver(setup);
    ro.observe(container);
    const io = new IntersectionObserver(([entry]) => {
      intersects = entry.isIntersecting;
      // Discard old scroll velocity when returning to the portrait.
      scrollRef.current = { velocity: 0, lastY: window.scrollY, lastTime: performance.now(), rippleTime: 0 };
      restart();
    });
    io.observe(container);
    const onMotionChange = () => {
      reducedRef.current = motion.matches;
      mouseRef.current.active = false;
      scrollRef.current.velocity = 0;
      setup();
    };
    motion.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', restart);
    img.src = src;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      disposed = true;
      restartRef.current = () => undefined;
      visibleRef.current = false;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect(); io.disconnect();
      img.onload = null;
      img.removeAttribute('src');
      dotsRef.current = [];
      canvas.width = canvas.height = 0;
      motion.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', restart);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, [src, buildDots, animate]);

  useEffect(() => {
    pausedRef.current = paused;
    restartRef.current();
  }, [paused]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || reducedRef.current || pausedRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseRef.current = {
      x: (e.clientX - rect.left) * (container.clientWidth / rect.width),
      y: (e.clientY - rect.top) * (container.clientHeight / rect.height),
      active: true,
    };
  };
  const handlePointerLeave = () => { mouseRef.current = { ...mouseRef.current, active: false }; };

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}
      onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} role="img" aria-label={alt}>
      <canvas ref={canvasRef} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${ready ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
