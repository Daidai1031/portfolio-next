'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // refs for raf loop (avoid stale closure)
  const stateRef = useRef({ pressed: false });
  useEffect(() => { stateRef.current.pressed = pressed; }, [pressed]);

  useEffect(() => {
    // Skip on touch devices — they don't have a cursor
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = -100, my = -100;
    let dx = -100, dy = -100;
    let rx = -100, ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      setVisible(true);

      const t = e.target as HTMLElement;
      const interactive = t.closest('a, button, [role="button"], [data-cursor-hover]');
      setHovering(!!interactive);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const tick = () => {
      // Dot snaps fast (almost direct), ring trails for soft lag
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;

      const scale = stateRef.current.pressed ? 0.8 : 1;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(() => {
      setEnabled(true);
      tick();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Soft halo + center dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-orange-500) 90%, transparent) 0%, color-mix(in srgb, var(--color-orange-500) 45%, transparent) 30%, color-mix(in srgb, var(--color-orange-500) 15%, transparent) 60%, transparent 100%)',
          opacity: visible ? (hovering ? 0 : 1) : 0,
          transform: 'translate3d(-100px,-100px,0) translate(-50%,-50%)',
          transition: 'opacity 0.25s ease, width 0.25s ease, height 0.25s ease',
          willChange: 'transform, opacity',
        }}
      />

      {/* Ring — appears on hover, scales on press */}
      <div
        ref={ringRef}
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: hovering ? 44 : 8,
          height: hovering ? 44 : 8,
          borderRadius: '50%',
          border: hovering ? '1.5px solid color-mix(in srgb, var(--color-orange-500) 85%, transparent)' : 'none',
          background: hovering ? 'transparent' : 'color-mix(in srgb, var(--color-orange-500) 100%, transparent)',
          opacity: visible ? 1 : 0,
          transform: 'translate3d(-100px,-100px,0) translate(-50%,-50%)',
          transition:
            'width 0.28s cubic-bezier(0.34,1.56,0.64,1), height 0.28s cubic-bezier(0.34,1.56,0.64,1), border 0.2s ease, background 0.2s ease, opacity 0.25s ease',
          willChange: 'transform',
        }}
      />
    </>
  );
}
