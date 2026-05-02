'use client';

import { useEffect, useState } from 'react';
import type { SectionDef } from '@/lib/section-types';

export type { SectionDef };

interface Props {
  sections: SectionDef[];
}

/**
 * Left-rail section navigator for the project detail page.
 * Visually mirrors the homepage `SectionNav` component but tracks
 * a list of section ids that get rendered as `<section id="...">`
 * inside the project body.
 *
 * The nav fades out once the user scrolls past the last section
 * (i.e. into Related Projects / footer), to keep it from sitting
 * on top of unrelated content.
 */
export default function ProjectSectionNav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (sections.length === 0) return;

    let rafId = 0;

    const updateNavState = () => {
      const focusLine = window.innerHeight * 0.35;
      let current = sections[0].id;

      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= focusLine) {
          current = id;
        } else {
          break;
        }
      }
      setActive((prev) => (prev === current ? prev : current));

      const firstEl = document.getElementById(sections[0].id);
      const lastEl = document.getElementById(sections[sections.length - 1].id);

      if (!firstEl || !lastEl) {
        setVisible(false);
        return;
      }

      const lastBottom = lastEl.getBoundingClientRect().bottom;
      const inRange = lastBottom > window.innerHeight * 0.15;
      setVisible((prev) => (prev === inRange ? prev : inRange));
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updateNavState);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (sections.length === 0) return null;

  return (
    <nav
      className="fixed left-3 xl:left-5 top-1/2 -translate-y-1/2 z-30 hidden w-24 xl:w-28 lg:flex flex-col items-start gap-5 transition-opacity duration-500"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      aria-label="Page sections"
    >
      {sections.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="group flex w-full items-center gap-2 cursor-pointer"
            aria-label={`Jump to ${label}`}
          >
            <div
              className="shrink-0 rounded-full transition-all duration-300"
              style={{
                width: isActive ? 8 : 5,
                height: isActive ? 8 : 5,
                backgroundColor: isActive ? '#f97316' : '#d1d5db',
              }}
            />
            <span
              className="min-w-0 flex-1 truncate text-[10px] tracking-wide transition-all duration-300 whitespace-nowrap xl:text-[11px]"
              style={{
                color: isActive ? '#f97316' : '#bbb',
                fontWeight: isActive ? 600 : 400,
                opacity: isActive ? 1 : 0.6,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
