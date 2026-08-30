'use client';

import { useEffect, useRef, useState } from 'react';

export interface ProgressSegment {
  id: string;
  label: string;
}

interface ReadingProgressBarProps {
  /**
   * Optional tick marks along the vertical rail (e.g. one per category /
   * section). Each id must match an element rendered elsewhere on the page
   * via `<section id="...">` or similar. Clicking a tick scrolls to it.
   * Ignored when `variant="horizontal-only"`.
   */
  segments?: ProgressSegment[];
  /**
   * "full"            — vertical rail with ticks on lg+ screens, plus a thin
   *                      horizontal bar under the fixed nav on smaller screens.
   * "horizontal-only"  — just the thin top bar, at every breakpoint. Use this
   *                      when a page already has its own vertical nav (e.g. the
   *                      project detail page's section rail) so we don't stack
   *                      two vertical rails.
   */
  variant?: 'full' | 'horizontal-only';
  position?: 'left' | 'right';
  /**
   * When true, strips the vertical rail down to just the track + fill line —
   * no tick dots, no percentage readout, no "Read" label. Use for a quieter,
   * purely ambient progress indicator.
   */
  minimal?: boolean;
}

/**
 * Fixed scroll-progress indicator. Tells the user how much of the page
 * they've read and how much is left — mainly so long, sectioned pages (like
 * /projects in "All" view, or a multi-section case study) don't look like
 * they've ended after the first screenful.
 */
export default function ReadingProgressBar({
  segments = [],
  variant = 'full',
  position = 'right',
  minimal = false,
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [activeSegment, setActiveSegment] = useState(segments[0]?.id ?? '');
  const [ticks, setTicks] = useState<
    { id: string; label: string; percent: number }[]
  >([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const pct = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      setProgress(pct);

      if (segments.length > 0) {
        const focusLine = window.innerHeight * 0.35;
        let current = segments[0].id;
        const nextTicks: { id: string; label: string; percent: number }[] = [];

        for (const { id, label } of segments) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const top = rect.top + scrollTop;
          nextTicks.push({
            id,
            label,
            percent: Math.min(Math.max(top / maxScroll, 0), 1) * 100,
          });
          if (rect.top <= focusLine) current = id;
        }

        setActiveSegment((prev) => (prev === current ? prev : current));
        setTicks(nextTicks);
      }
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments.length]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pctLabel = `${Math.round(progress * 100)}%`;
  const sideClass = position === 'left' ? 'left-4 xl:left-6' : 'right-4 xl:right-6';
  const labelSideClass = position === 'right' ? 'right-4' : 'left-4';

  return (
    <>
      {/* Thin top bar — always on mobile; every breakpoint for horizontal-only */}
      <div
        className={`fixed top-0 left-0 right-0 z-[60] h-[2px] bg-gray-200/60 ${
          variant === 'full' ? 'lg:hidden' : ''
        }`}
        aria-hidden
      >
        <div
          className="h-full bg-orange-500 transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Vertical rail — desktop only, "full" variant */}
      {variant === 'full' && (
        <div
          className={`fixed ${sideClass} top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3`}
        >
          {!minimal && (
            <span className="text-[10px] font-medium tracking-wide text-gray-400 tabular-nums">
              {pctLabel}
            </span>
          )}

          <div className="relative w-[2px] h-[180px] xl:h-[220px] rounded-full bg-gray-200">
            <div
              className="absolute top-0 left-0 w-full rounded-full bg-orange-500 transition-[height] duration-150 ease-out"
              style={{ height: `${progress * 100}%` }}
            />

            {!minimal &&
              ticks.map((tick) => {
                const isActive = activeSegment === tick.id;
                return (
                  <button
                    key={tick.id}
                    type="button"
                    onClick={() => scrollTo(tick.id)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2"
                    style={{ top: `${tick.percent}%`, left: '50%' }}
                    aria-label={`Jump to ${tick.label}`}
                  >
                    <span
                      className="block rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? 8 : 6,
                        height: isActive ? 8 : 6,
                        backgroundColor: isActive ? '#f97316' : '#ffffff',
                        border: `1.5px solid ${isActive ? '#f97316' : '#d1d5db'}`,
                      }}
                    />
                    <span
                      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] tracking-wide transition-opacity duration-200 ${labelSideClass} ${
                        isActive
                          ? 'opacity-100 font-medium text-orange-500'
                          : 'opacity-0 text-gray-500 group-hover:opacity-100'
                      }`}
                    >
                      {tick.label}
                    </span>
                  </button>
                );
              })}
          </div>

          {!minimal && (
            <span className="text-[9px] uppercase tracking-widest text-gray-300">
              Read
            </span>
          )}
        </div>
      )}
    </>
  );
}