'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'categories', label: 'Focus' },
  { id: 'projects', label: 'Projects' },
];

export default function SectionNav() {
  const [active, setActive] = useState('hero');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      // Find which section is most in view
      let current = 'hero';
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Section is "active" when its top is above 60% of viewport
        if (rect.top < window.innerHeight * 0.6) {
          current = id;
        }
      }
      setActive(current);
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
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
        className="fixed left-4 xl:left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-start gap-6 transition-opacity duration-500"
        style={{
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? 'auto' : 'none',
        }}
        >
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="group flex items-center gap-3 cursor-pointer"
          >
            {/* Line + dot indicator */}
            <div className="relative flex items-center">
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 8 : 4,
                  height: isActive ? 8 : 4,
                  backgroundColor: isActive ? '#f97316' : '#d1d5db',
                }}
              />
              <div
                className="h-px transition-all duration-300 ml-1"
                style={{
                  width: isActive ? 24 : 0,
                  backgroundColor: '#f97316',
                  opacity: isActive ? 1 : 0,
                }}
              />
            </div>
            {/* Label */}
            <span
              className="text-[11px] tracking-wide transition-all duration-300 whitespace-nowrap"
              style={{
                color: isActive ? '#f97316' : '#bbb',
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