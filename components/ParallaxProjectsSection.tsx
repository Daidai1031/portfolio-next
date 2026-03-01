'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';

interface ProjectItem {
  slug: string; title: string; subtitle?: string; category: string;
  year?: number; heroUrl?: string | null; url: string; order?: number; featured?: boolean;
}
interface Props {
  projects: ProjectItem[];
  categoryDisplayNames: Record<string, string>;
}

/* ── Dot-matrix digit patterns (4×7) ───────────────────────── */
const DIGIT_PATTERNS: Record<string, number[][]> = {
  '0':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  '1':[[0,0,1,0],[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,1,1,1]],
  '2':[[0,1,1,0],[1,0,0,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
  '3':[[0,1,1,0],[1,0,0,1],[0,0,0,1],[0,0,1,0],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
  '4':[[0,0,1,0],[0,1,1,0],[1,0,1,0],[1,0,1,0],[1,1,1,1],[0,0,1,0],[0,0,1,0]],
  '5':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[0,0,0,1],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
  '6':[[0,1,1,0],[1,0,0,0],[1,0,0,0],[1,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  '7':[[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,0,1,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  '8':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  '9':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,1],[0,0,0,1],[0,0,0,1],[0,1,1,0]],
};

function DotMatrixNumber({ value, dotSize = 6, gap = 3, color = '#000' }: {
  value: string; dotSize?: number; gap?: number; color?: string;
}) {
  const digits = value.split('');
  const cellSize = dotSize + gap;
  return (
    <div className="flex" style={{ gap: `${gap * 2}px` }}>
      {digits.map((digit, di) => {
        const pattern = DIGIT_PATTERNS[digit];
        if (!pattern) return null;
        return (
          <div key={di} style={{ display:'grid', gridTemplateColumns:`repeat(4,${cellSize}px)`, gridTemplateRows:`repeat(7,${cellSize}px)` }}>
            {pattern.flat().map((on, i) => (
              <div key={i} style={{ width:dotSize, height:dotSize, borderRadius:'50%',
                backgroundColor: on ? color : 'transparent', opacity: on ? 1 : 0.08,
                transition:'background-color 0.3s, opacity 0.3s' }} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function ParallaxProjectsSection({ projects, categoryDisplayNames }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const smoothRef = useRef(0);
  const rafRef = useRef(0);
  const total = projects.length;
  const perItem = 1 / total;

  const isAtEnd = activeIndex === total - 1 && progress > (total - 1) * perItem + perItem * 0.3;
  // How far into scrolling we are — 0 = title phase, >0.02 = projects visible
  const hasStartedScrolling = progress > 0.015;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let target = 0;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      target = Math.max(0, Math.min(1, -rect.top / scrollable));
    };
    const tick = () => {
      smoothRef.current += (target - smoothRef.current) * 0.08;
      setProgress(smoothRef.current);
      setActiveIndex(Math.max(0, Math.min(Math.floor(smoothRef.current * total), total - 1)));
      rafRef.current = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafRef.current); };
  }, [total]);

  function getLocal(i: number) { return (progress - i * perItem) / perItem; }

  function fadeStyle(i: number, axis: 'y' | 'x') {
    const local = getLocal(i);
    let offset = 100, opacity = 0;
    if (local >= 0 && local <= 1) {
      opacity = 1; offset = 0;
      if (local < 0.12) { const t = local/0.12; offset = (1-t)*50; opacity = t; }
      else if (local > 0.88) { const t = (local-0.88)/0.12; offset = -t*50; opacity = 1-t; }
    } else if (local > 1) { offset = -100; opacity = 0; }
    const transform = axis === 'y' ? `translateY(${offset}%)` : `translateX(${offset > 0 ? offset*0.5 : offset*0.25}px)`;
    return { transform, opacity, willChange:'transform, opacity' as const, position:'absolute' as const, inset:0 as const };
  }

  function centerFade(i: number) {
    const local = getLocal(i);
    let yPct = 100, opacity = 0;
    if (local >= 0 && local <= 1) {
      opacity = 1; yPct = 0;
      if (local < 0.12) { const t = local/0.12; yPct = (1-t)*40; opacity = t; }
      else if (local > 0.88) { const t = (local-0.88)/0.12; yPct = -t*40; opacity = 1-t; }
    } else if (local > 1) { yPct = -100; opacity = 0; }
    return { yPct, opacity, isActive: local >= 0 && local <= 1 };
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${total * 100 + 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">

        {/* ── Title: big centered → small top-left on scroll ── */}
        <div
          className="absolute z-20 transition-all duration-700 ease-out"
          style={{
            ...(hasStartedScrolling
              ? {
                  top: '1.1rem',
                  left: 'clamp(24px, 12vw, 180px)',
                  transform: 'none',
                }
              : {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }),
          }}
        >
          <p
            className="uppercase tracking-wider font-medium transition-all duration-700"
            style={{
              fontSize: hasStartedScrolling ? '0.6rem' : '0.75rem',
              color: hasStartedScrolling ? '#bbb' : '#9ca3af',
              marginBottom: hasStartedScrolling ? '0.1rem' : '0.75rem',
            }}
          >
            Portfolio
          </p>
          <h2
            className="font-bold transition-all duration-700 whitespace-nowrap"
            style={{
              fontSize: hasStartedScrolling ? '0.95rem' : 'clamp(2rem, 5vw, 3.5rem)',
              color: hasStartedScrolling ? '#bbb' : '#000',
              textAlign: hasStartedScrolling ? 'left' : 'center',
            }}
          >
            My{' '}
            <span
              className="transition-colors duration-700"
              style={{ color: hasStartedScrolling ? '#ccc' : '#f97316' }}
            >
              Projects
            </span>
          </h2>
        </div>

        {/* ── Scroll hint (only in title phase) ── */}
        <div
          className="absolute bottom-10 left-1/2 flex flex-col items-center gap-1.5 pointer-events-none transition-opacity duration-500 z-20"
          style={{ transform: 'translateX(-50%)', opacity: hasStartedScrolling ? 0 : 1 }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="animate-bounce">
            <path d="M7 10L0 0h14L7 10z" fill="#f97316" />
          </svg>
          <span className="text-[10px] text-gray-400 tracking-wider">Scroll</span>
        </div>

        {/* ════ DESKTOP 3-column (hidden during title phase) ════ */}
        <div
          className="hidden lg:grid flex-1 min-h-0 items-center transition-opacity duration-500"
          style={{
            gridTemplateColumns: '0.58fr 2.6fr 1fr',
            gap: '3rem',
            paddingLeft: 'clamp(24px, 12vw, 180px)',
            paddingRight: 'clamp(24px, 12vw, 180px)',
            paddingTop: '3.5rem',
            opacity: hasStartedScrolling ? 1 : 0,
            pointerEvents: hasStartedScrolling ? 'auto' : 'none',
          }}
        >
          {/* LEFT: dot-matrix counter */}
          <div className="relative h-[65vh]">
            {projects.map((project, i) => (
              <div key={`l-${project.slug}`} className="flex flex-col justify-center" style={fadeStyle(i, 'y')}>
                <div className="flex items-end gap-3">
                  <DotMatrixNumber value={String(i+1).padStart(2,'0')} dotSize={7} gap={4} color="#111" />
                  <span className="text-sm text-gray-400 mb-1">/{String(total).padStart(2,'0')}</span>
                </div>
                {project.subtitle && (
                  <p className="text-xs text-gray-400 mt-5 max-w-[170px] leading-relaxed line-clamp-2">{project.subtitle}</p>
                )}
              </div>
            ))}
          </div>

          {/* CENTER: 4:3 image */}
          <div className="relative" style={{ aspectRatio: '4 / 3' }}>
            {projects.map((project, i) => {
              const s = centerFade(i);
              return (
                <Link key={`c-${project.slug}`} href={project.url} className="absolute inset-0 block group"
                  style={{ transform:`translateY(${s.yPct}%)`, opacity:s.opacity, willChange:'transform, opacity', pointerEvents:s.isActive?'auto':'none' }}>
                  <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
                    {project.heroUrl ? (
                      <Image src={project.heroUrl} alt={project.title} fill
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" sizes="55vw" />
                    ) : ( <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" /> )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* RIGHT: title + dot nav */}
          <div className="relative h-[65vh] pl-6 xl:pl-10">
            {projects.map((project, i) => (
              <div key={`r-${project.slug}`} className="flex flex-col justify-center" style={fadeStyle(i, 'x')}>
                <Link href={project.url} className="group">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-2 font-medium">{categoryDisplayNames[project.category] || project.category}</p>
                  <h3 className="text-base xl:text-xl font-bold mb-2 leading-tight group-hover:text-orange-500 transition-colors">{project.title}</h3>
                  {project.year && <p className="text-sm text-gray-400 mb-3">{project.year}</p>}
                  <span className="inline-flex items-center gap-2 text-xs text-gray-400 group-hover:text-orange-500 transition-colors">
                    View Project
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </div>
            ))}
            {/* Dot nav + back to top */}
            <div className="absolute right-[-5rem] top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
            {/* Back to top */}
            <button
                onClick={scrollToTop}
                className="mb-1 text-gray-300 hover:text-orange-500 transition-all duration-500"
                style={{ opacity: isAtEnd ? 1 : 0, pointerEvents: isAtEnd ? 'auto' : 'none' }}
                aria-label="Back to top"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>
            {/* Dots */}
            {projects.map((_, i) => (
                <div key={`nav-${i}`} className={`rounded-full transition-all duration-300 ${i===activeIndex?'w-2.5 h-2.5 bg-orange-500':'w-1.5 h-1.5 bg-gray-300'}`} />
            ))}

            </div>
          </div>
        </div>

        {/* ════ MOBILE ════ */}
        <div className="lg:hidden flex-1 min-h-0 relative"
          style={{ paddingLeft:'clamp(24px,10vw,144px)', paddingRight:'clamp(24px,10vw,144px)',
            opacity: hasStartedScrolling ? 1 : 0, transition:'opacity 0.5s', pointerEvents: hasStartedScrolling ? 'auto' : 'none' }}>
          {projects.map((project, i) => {
            const local = getLocal(i);
            const isActive = local >= 0 && local <= 1;
            let opacity = 0, yPct = 30;
            if (isActive) { opacity=1; yPct=0;
              if (local<0.12){opacity=local/0.12; yPct=(1-local/0.12)*30;}
              else if(local>0.88){opacity=1-(local-0.88)/0.12; yPct=-((local-0.88)/0.12)*30;}
            } else if(local>1){opacity=0; yPct=-30;}
            return (
              <Link key={`m-${project.slug}`} href={project.url}
                className="absolute inset-0 flex flex-col justify-center"
                style={{ transform:`translateY(${yPct}%)`, opacity, willChange:'transform, opacity',
                  pointerEvents:isActive?'auto':'none', paddingLeft:'clamp(24px,10vw,144px)', paddingRight:'clamp(24px,10vw,144px)' }}>
                <div className="mb-2 flex items-end gap-2">
                  <DotMatrixNumber value={String(i+1).padStart(2,'0')} dotSize={4} gap={2} color="#111" />
                  <span className="text-xs text-gray-300 mb-0.5">/{String(total).padStart(2,'0')}</span>
                </div>
                <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 mb-3" style={{ aspectRatio:'4/3' }}>
                  {project.heroUrl ? <Image src={project.heroUrl} alt={project.title} fill
                    className="object-cover transition-all duration-1000"
                    style={{ filter: isActive && local > 0.08 ? 'grayscale(0)' : 'grayscale(1)' }}
                    sizes="90vw" />
                    : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />}
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-500 mb-1 font-medium">{categoryDisplayNames[project.category]||project.category}</p>
                <h3 className="text-base font-bold leading-tight">{project.title}</h3>
                {project.year && <p className="text-xs text-gray-400 mt-1">{project.year}</p>}
              </Link>
            );
          })}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <button
                onClick={scrollToTop}
                className="mb-1 text-gray-300 hover:text-orange-500 transition-all duration-500"
                style={{ opacity: isAtEnd ? 1 : 0, pointerEvents: isAtEnd ? 'auto' : 'none' }}
                aria-label="Back to top"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>
            {projects.map((_,i) => (
                <div key={`mdot-${i}`} className={`rounded-full transition-all duration-300 ${i===activeIndex?'w-2 h-2 bg-orange-500':'w-1 h-1 bg-gray-300'}`} />
            ))}
            </div>

        </div>

        {/* ── Back to top ── */}
        <button onClick={scrollToTop}
        className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 transition-all duration-500 z-20"
        style={{ transform:`translateX(-50%) translateY(${isAtEnd?'0':'10px'})`, opacity:isAtEnd?1:0, pointerEvents:isAtEnd?'auto':'none' }}>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M7 0L14 10H0L7 0z" fill="#f97316" />
        </svg>
        <span className="text-[10px] text-gray-400 tracking-wider hover:text-orange-500 transition-colors">Back to Top</span>
        </button>


      </div>
    </section>
  );
}