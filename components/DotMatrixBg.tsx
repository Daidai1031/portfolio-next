'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface DotMatrixBgProps {
  className?: string;
  dotSize?: number;
  gap?: number;
  color?: string;
  influenceRadius?: number;
  displaceStrength?: number;
  children?: React.ReactNode;
}

interface Dot {
  ox: number; oy: number; x: number; y: number;
  // For ripple effect
  rippleOffset: number;
}

export default function DotMatrixBg({
  className = '',
  dotSize = 2,
  gap = 28,
  color = '#d1d5db',
  influenceRadius = 90,
  displaceStrength = 14,
  children,
}: DotMatrixBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const scrollRef = useRef({ velocity: 0, lastY: 0, lastTime: 0, rippleTime: 0 });
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  const buildGrid = useCallback((cw: number, ch: number) => {
    if (cw < 2 || ch < 2) return;
    const dots: Dot[] = [];
    const centerX = cw / 2;
    const centerY = ch / 2;
    for (let y = gap / 2; y < ch; y += gap) {
      for (let x = gap / 2; x < cw; x += gap) {
        // Distance from center for ripple wave
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        dots.push({ ox: x, oy: y, x, y, rippleOffset: dist });
      }
    }
    dotsRef.current = dots;
  }, [gap]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = mouseRef.current;
    const scroll = scrollRef.current;
    const dots = dotsRef.current;
    const ir = influenceRadius;
    const ir2 = ir * ir;
    const ease = 0.1;
    const now = performance.now();

    // Decay scroll velocity
    scroll.velocity *= 0.96;
    const absVel = Math.abs(scroll.velocity);
    const hasRipple = absVel > 0.3;

    if (hasRipple) {
      scroll.rippleTime = now;
    }
    // Keep ripple alive briefly after scroll stops
    const rippleFade = Math.max(0, 1 - (now - scroll.rippleTime) / 800);

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      let tx = dot.ox, ty = dot.oy;
      let scale = 1;

      // Desktop: pointer interaction
      if (mouse.active) {
        const dx = dot.ox - mouse.x;
        const dy = dot.oy - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < ir2) {
          const dist = Math.sqrt(dist2);
          const force = 1 - dist / ir;
          const angle = Math.atan2(dy, dx);
          tx = dot.ox + Math.cos(angle) * force * displaceStrength;
          ty = dot.oy + Math.sin(angle) * force * displaceStrength;
          scale = 1 + force * 1.5;
        }
      }

      // Mobile: scroll-velocity ripple wave
      if (rippleFade > 0.01) {
        // Wave propagates outward from center
        const waveSpeed = 0.15; // px per ms
        const elapsed = now - scroll.rippleTime + 500; // offset so wave is mid-travel
        const wavePos = elapsed * waveSpeed;
        const distFromWave = Math.abs(dot.rippleOffset - (wavePos % (dot.rippleOffset + 500)));
        const waveInfluence = Math.max(0, 1 - distFromWave / 120);

        const rippleAmount = Math.min(absVel, 15) * waveInfluence * rippleFade;
        const rippleAngle = (dot.rippleOffset * 0.02 + now * 0.003) * (scroll.velocity > 0 ? 1 : -1);

        tx += Math.cos(rippleAngle) * rippleAmount * 0.6;
        ty += Math.sin(rippleAngle) * rippleAmount * 0.8;
        scale = 1 + waveInfluence * rippleFade * Math.min(absVel / 10, 1) * 0.8;
      }

      dot.x += (tx - dot.x) * ease;
      dot.y += (ty - dot.y) * ease;

      const r = dotSize * scale;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6 + Math.min(scale - 1, 0.4);
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(animate);
  }, [color, dotSize, influenceRadius, displaceStrength]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const setup = () => {
      const rect = container.getBoundingClientRect();
      const cw = Math.round(rect.width);
      const ch = Math.round(rect.height);
      if (cw < 2 || ch < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid(cw, ch);
      setReady(true);
    };

    // Track scroll velocity
    const onScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dt = now - scrollRef.current.lastTime;
      if (dt > 0) {
        scrollRef.current.velocity = (currentY - scrollRef.current.lastY) / Math.max(dt, 1) * 16;
      }
      scrollRef.current.lastY = currentY;
      scrollRef.current.lastTime = now;
    };

    // Touch tracking for more responsive mobile feel
    let lastTouchY = 0;
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
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
      lastTouchY = e.touches[0]?.clientY ?? 0;
      scrollRef.current.lastTime = performance.now();
    };

    let ro: ResizeObserver | null = null;
    requestAnimationFrame(() => {
      setup();
      ro = new ResizeObserver(() => {
        cancelAnimationFrame(rafRef.current);
        setup();
        rafRef.current = requestAnimationFrame(animate);
      });
      ro.observe(container);
      rafRef.current = requestAnimationFrame(animate);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, [buildGrid, animate]);

  const handlePointerMove = (e: React.PointerEvent) => {
    // Only respond to mouse/pen, not touch (touch uses scroll ripple)
    if (e.pointerType === 'touch') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
  };

  const handlePointerLeave = () => {
    mouseRef.current = { ...mouseRef.current, active: false };
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}