'use client';

import { useEffect, useState } from 'react';

export type SectionNavItem = { id: string; label: string };

const DEFAULT_SECTIONS: SectionNavItem[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'categories', label: 'Focus' },
  { id: 'projects', label: 'Projects' },
];

export default function SectionNav({
  sections = DEFAULT_SECTIONS,
  fadeItems = false,
  revealActive = true,
}: {
  sections?: SectionNavItem[];
  /** Fade each item in as its section enters view and out once it leaves. */
  fadeItems?: boolean;
  /** Home page: hold the rail hidden until the top bar has dropped in. */
  revealActive?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [inView, setInView] = useState<Record<string, boolean>>({});
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      let current: string | null = null;
      const seen: Record<string, boolean> = {};
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // "In view" once any part of the section is on screen.
        seen[id] = rect.bottom > vh * 0.12 && rect.top < vh * 0.88;
        // "Active" (orange) when its top has scrolled past 60% of the viewport.
        if (rect.top < vh * 0.6) current = id;
      }
      setActive(current);
      setInView(seen);

      const projectsEl = document.getElementById('projects');
      if (projectsEl) {
        const rect = projectsEl.getBoundingClientRect();
        const scrollable = projectsEl.offsetHeight - window.innerHeight;
        const scrolled = scrollable > 0 ? -rect.top / scrollable : 0;
        setVisible(scrolled < 0.0); // 项目开始滚动后才淡出
      } else {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
        className="fixed left-4 xl:left-6 top-1/2 z-40 hidden lg:flex flex-col items-start gap-6 transition-[opacity,transform] duration-500 ease-out"
        style={{
            opacity: visible && revealActive ? 1 : 0,
            transform: `translateY(-50%) translateX(${revealActive ? 0 : -14}px)`,
            pointerEvents: visible && revealActive ? 'auto' : 'none',
        }}
        >
      {sections.map(({ id, label }) => {
        const isActive = active === id;
        const itemShown = fadeItems ? Boolean(inView[id]) : true;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="group flex items-center gap-3 cursor-pointer transition-all duration-500"
            style={{
              opacity: itemShown ? 1 : 0.22,
              transform: `translateX(${itemShown ? 0 : -6}px)`,
            }}
          >
            {/* Line + dot indicator */}
            <div className="relative flex items-center">
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 8 : 4,
                  height: isActive ? 8 : 4,
                  backgroundColor: isActive ? '#FF6900' : '#d1d5db',
                }}
              />
              <div
                className="h-px transition-all duration-300 ml-1"
                style={{
                  width: isActive ? 24 : 0,
                  backgroundColor: '#FF6900',
                  opacity: isActive ? 1 : 0,
                }}
              />
            </div>
            {/* Label */}
            <span
              className="text-[11px] tracking-wide transition-all duration-300 whitespace-nowrap"
              style={{
                color: isActive ? '#FF6900' : '#bbb',
                fontWeight: isActive ? 600 : 400,
                transform: `translateX(${isActive ? 0 : -4}px)`,
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
