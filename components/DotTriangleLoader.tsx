'use client';

import { useEffect, useRef, useState } from 'react';

interface DotTriangleLoaderProps {
  size?: number;
  dotSize?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const MATRIX_SIZE = 7;
const BASE_OPACITY = 0.06;
const HIGH_OPACITY = 0.95;
const TRAIL_SPAN = 4.35;
const CYCLE_MS = 1500;

const TRIANGLE_CELLS = new Set([
  '1,3', '2,2', '2,4', '3,1', '3,3', '3,5', '4,0', '4,2', '4,4', '4,6',
]);

// Traces the triangle's silhouette (rim up, rim down) then cuts through the
// center, so the glow reads as a crossing "infinity" loop rather than a lap.
const INFINITY_PATH: ReadonlyArray<readonly [number, number]> = [
  [4, 0], [3, 1], [2, 2], [1, 3], [2, 4], [3, 5], [4, 6], [4, 4], [3, 3], [4, 2],
];

const PATH_LEN = INFINITY_PATH.length;

const CELL_PATH_INDEX = new Map<string, number>(
  INFINITY_PATH.map(([r, c], i) => [`${r},${c}`, i])
);

function modF(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function smoothstep01(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function opacityForCell(row: number, col: number, phase: number): number {
  const idx = CELL_PATH_INDEX.get(`${row},${col}`);
  if (idx === undefined) return 0;

  const s = phase * PATH_LEN;
  const behind = modF(s - idx, PATH_LEN);
  const glow = 1 - smoothstep01(0, TRAIL_SPAN, behind);
  return BASE_OPACITY + glow * (HIGH_OPACITY - BASE_OPACITY);
}

export default function DotTriangleLoader({
  size = 30,
  dotSize = 4,
  color = '#FF6900',
  className = '',
  ariaLabel = 'Loading',
}: DotTriangleLoaderProps) {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPhase(0.12);
      return;
    }

    const tick = (t: number) => {
      if (!startRef.current) startRef.current = t;
      const elapsed = t - startRef.current;
      setPhase((elapsed % CYCLE_MS) / CYCLE_MS);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const gap = Math.max(1, Math.floor((size - dotSize * MATRIX_SIZE) / (MATRIX_SIZE - 1)));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: `repeat(${MATRIX_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${MATRIX_SIZE}, minmax(0, 1fr))`,
        gap,
        color,
      }}
    >
      {Array.from({ length: MATRIX_SIZE * MATRIX_SIZE }).map((_, index) => {
        const row = Math.floor(index / MATRIX_SIZE);
        const col = index % MATRIX_SIZE;
        const isActive = TRIANGLE_CELLS.has(`${row},${col}`);
        const opacity = isActive ? opacityForCell(row, col, phase) : 0;

        return (
          <span
            key={index}
            aria-hidden="true"
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '9999px',
              backgroundColor: 'currentColor',
              opacity,
            }}
          />
        );
      })}
    </div>
  );
}
