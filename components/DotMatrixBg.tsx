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
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  const buildGrid = useCallback((cw: number, ch: number) => {
    if (cw < 2 || ch < 2) return;
    const dots: Dot[] = [];
    for (let y = gap / 2; y < ch; y += gap) {
      for (let x = gap / 2; x < cw; x += gap) {
        dots.push({ ox: x, oy: y, x, y });
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
    const dots = dotsRef.current;
    const ir = influenceRadius;
    const ir2 = ir * ir;
    const ease = 0.1;

    // Parse color once
    ctx.fillStyle = color;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      let tx = dot.ox, ty = dot.oy;
      let scale = 1;

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
          scale = 1 + force * 1.5; // dots grow near cursor
        }
      }

      dot.x += (tx - dot.x) * ease;
      dot.y += (ty - dot.y) * ease;

      const r = dotSize * scale;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

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

    return () => { cancelAnimationFrame(rafRef.current); ro?.disconnect(); };
  }, [buildGrid, animate]);

  const handlePointerMove = (e: React.PointerEvent) => {
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