'use client'

import FocusCards from "@/components/FocusCards";
import { getAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";
import { useEffect, useState } from "react";
import { Mail, Github, Linkedin } from "lucide-react";
import DotMatrixPortrait from "@/components/DotMatrixPortrait";
import DaisyPeek from "@/components/DaisyPeek";
import IntroOverlay from "@/components/IntroOverlay";
import ParallaxProjectsSection from "@/components/ParallaxProjectsSection";
import DotMatrixBg from "@/components/DotMatrixBg";
import SectionNav from "@/components/SectionNav";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { categoryNames } from "@/lib/project-categories";

const categoryDisplayNames: Record<string, string> = categoryNames;
const featuredProjectSlugs = [
  'camino-quest-board-game',
  'prompt',
  'geomelody',
  'socratidesk',
  'subway-telltale',
  'encoded-elevation',
  'ironic-shaxi',
  '3d-printed-bamboo-structure',
  'river-life-museum-xiguan',
];

const focusCategoryProjects = [
  { slug: 'physical-computing', heroProjectSlug: 'geomelody' },
  { slug: 'ai-digital-products', heroProjectSlug: 'into-place' },
  { slug: 'creative-media', heroProjectSlug: 'camino-quest-board-game' },
  { slug: 'architecture-fabrication', heroProjectSlug: '3d-printed-bamboo-structure' },
] as const;

export default function HomePage() {
  const projects = getAllProjects();
  const featuredProjects = featuredProjectSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  const [displayText, setDisplayText] = useState("");
  const [heroStage, setHeroStage] = useState<'typing' | 'hold' | 'gap' | 'daisy' | 'done'>('typing');
  const showDaisy = heroStage === 'daisy' || heroStage === 'done';
  const heroSettled = heroStage === 'done';
  const pausePortrait = heroStage === 'gap' || heroStage === 'daisy';
  const [phase, setPhase] = useState<'pending' | 'intro' | 'ready' | 'instant'>('pending');
  const [hasHoveredPortrait, setHasHoveredPortrait] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const [chromeReady, setChromeReady] = useState(false);
  const introDone = phase === 'ready' || phase === 'instant';
  const fullText = "Hi, I'm DINGRAN";

  // Opening plays on every page load, except for reduced-motion visitors.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { setPhase('instant'); return; }
      setPhase('intro');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!introDone || heroStage === 'done') return;
    let timeout: ReturnType<typeof setTimeout>;
    if (heroStage === 'typing') {
      timeout = setTimeout(() => {
        const next = fullText.slice(0, displayText.length + 1);
        setDisplayText(next);
        if (next === fullText) setHeroStage('hold');
      }, 62);
    } else if (heroStage === 'hold') {
      timeout = setTimeout(() => {
        setHeroStage('gap');
      }, 700);
    } else if (heroStage === 'gap') {
      timeout = setTimeout(() => setHeroStage('daisy'), 150);
    } else {
      // Let the full rise, pause, and eye-opening sequence finish before the
      // headline moves upward and the supporting content begins to appear.
      timeout = setTimeout(() => setHeroStage('done'), 910);
    }
    return () => clearTimeout(timeout);
  }, [displayText, heroStage, introDone]);

  // The top nav bar holds off until the hero's left column has fully arrived —
  // typing, daisy, then every heroReveal item (the last, "Scroll Down" at
  // 1540ms, finishes its 1100ms rise ~2640ms after heroSettled). Only then does
  // the bar drop in from the top edge, so nothing competes with it.
  useEffect(() => {
    if (phase === 'instant') { setNavReady(true); return; }
    if (!heroSettled) return;
    const timeout = setTimeout(() => setNavReady(true), 2500);
    return () => clearTimeout(timeout);
  }, [heroSettled, phase]);

  // The peripheral chrome — the left section rail and the portrait's "hover"
  // hint — slides in just behind the top bar's drop, so the order reads
  // top bar → side rail → hint (which then animates immediately).
  useEffect(() => {
    if (phase === 'instant') { setChromeReady(true); return; }
    if (!navReady) return;
    const timeout = setTimeout(() => setChromeReady(true), 550);
    return () => clearTimeout(timeout);
  }, [navReady, phase]);

  const heroReveal = (delay: number): React.CSSProperties => ({
    opacity: heroSettled ? 1 : 0,
    transform: heroSettled ? 'translateY(0)' : 'translateY(14px)',
    transitionDelay: `${delay}ms`,
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}#intro-veil{display:none!important}`}</style>
      </noscript>
      {/* Rendered server-side so the very first paint is blank white — without it the
          browser flashes the hero's grey portrait box and orange corner brackets
          before the overlay mounts. Swapped for the real overlay in the same commit. */}
      {phase === 'pending' && (
        <div id="intro-veil" aria-hidden className="fixed inset-0 z-[100] bg-white pointer-events-none" />
      )}
      {phase === 'intro' && (
        <IntroOverlay src={siteConfig.portrait} mirrored onDone={() => setPhase('ready')} />
      )}
      <SectionNav revealActive={chromeReady || phase === 'instant'} />
      <SiteHeader reveal revealActive={navReady} />

      {/* Hero */}
      <section id="hero" className="site-page-gutters min-h-screen flex items-center pt-12 pb-20 lg:pt-32 lg:pb-48">
        <div className="w-full">
          <div className="hero-grid grid items-center">
            <div className="hero-grid-portrait-mobile relative lg:hidden">
              <div data-portrait-target className="group aspect-square relative overflow-hidden max-w-xs cursor-pointer">
                <DotMatrixPortrait src={siteConfig.portrait} alt={siteConfig.name} resolution={6} dotRadius={2.2} influenceRadius={60} displaceStrength={14} paused={pausePortrait} mirrored />
              </div>
            </div>
            <h1 className="hero-grid-heading lg:translate-y-[76px] text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-snug lg:leading-tight min-h-[2.5em] lg:mb-4">
              <span className="block whitespace-nowrap">
                {displayText.slice(0, 8).split('').map((char, i) => (
                  <span key={i} className={i === displayText.length - 1 && heroStage === 'typing' ? 'text-orange-500' : ''}>{char}</span>
                ))}
                {displayText.length < 8 && heroStage !== 'done' && (
                  <span aria-hidden className="relative inline-block w-0 align-middle">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">
                      <span className="block w-1 h-10 lg:h-20 bg-orange-500 animate-pulse motion-reduce:animate-none" />
                    </span>
                  </span>
                )}
              </span>
              <span className="block whitespace-nowrap">
                <span className="block min-h-[1.375em] lg:min-h-0">
                  {displayText.slice(8).split('').map((char, i) => (
                    <span key={i} className={i + 8 === displayText.length - 1 && heroStage === 'typing' ? 'text-orange-500' : ''}>{char}</span>
                  ))}
                  {displayText.length >= 8 && heroStage !== 'done' && (
                    <span aria-hidden className="relative inline-block w-0 align-middle">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 transition-opacity duration-[220ms] motion-reduce:transition-none" style={{ opacity: showDaisy ? 0 : 1 }}>
                        <span className="block w-1 h-10 lg:h-20 bg-orange-500 animate-pulse motion-reduce:animate-none" />
                      </span>
                    </span>
                  )}
                  {showDaisy && (
                    <span className="block mt-2 min-h-[1.1em] lg:mt-0 lg:min-h-0 lg:inline">
                      <DaisyPeek inline width="1.15em" peek={0.78} verticalAlign="-0.2em" className="lg:ml-[0.32em]" rise riseMs={460}
                        travel={16.5} minOffset={10.5} rest={11.5} restQuadrant="DL"
                        morph={0.6} lidRadius={88} blinkMs={400} bell={3} parallax={3} />
                    </span>
                  )}
                </span>
                {!showDaisy && <span aria-hidden className="block mt-2 min-h-[1.1em] lg:hidden" />}
              </span>
            </h1>
            <div className="hero-grid-body lg:translate-y-10">
              <div className={`grid transition-[grid-template-rows] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${heroSettled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="min-h-0 overflow-hidden">
                  <p data-hero-reveal style={heroReveal(520)} className="text-base lg:text-xl text-gray-600 mt-4 lg:mt-6 mb-8 lg:mb-10 max-w-[62ch] leading-relaxed transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!transition-none motion-reduce:!transform-none">
                    Designer and technologist with a background in architecture,{' '}<br className="hidden sm:block lg:hidden min-[87.5rem]:block" />
                    building playful and trustworthy interactive experiences,{' '}<br className="hidden sm:block lg:hidden min-[87.5rem]:block" />
                    through <span className="inline-block text-orange-500 font-bold -rotate-3">rapid prototyping</span> and{' '}
                    <span className="inline-block text-orange-500 font-bold rotate-6">AI</span>.
                  </p>
                  <p data-hero-reveal className={`text-xs lg:text-sm text-orange-500 lg:text-white mb-6 lg:inline-block lg:bg-orange-500 lg:px-4 lg:py-1.5 tracking-[0.25em] uppercase ${heroSettled ? 'hero-badge-stick' : 'opacity-0'}`}>Design •{' '}Develop •{' '}Fabrication</p>
                  <div data-hero-reveal style={heroReveal(1200)} className="flex items-center -ml-1.5 lg:-ml-2 mt-2 gap-2 lg:gap-3 mb-6 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!transition-none motion-reduce:!transform-none">
                    <a href={`mailto:${siteConfig.social.email}`} className="p-1.5 lg:p-2 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors duration-300">
                      <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
                    </a>
                    <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 lg:p-2 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors duration-300">
                      <Linkedin className="w-5 h-5 lg:w-6 lg:h-6" />
                    </a>
                    <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="p-1.5 lg:p-2 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors duration-300">
                      <Github className="w-5 h-5 lg:w-6 lg:h-6" />
                    </a>
                  </div>
                  <div data-hero-reveal style={heroReveal(1540)} className="transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!transition-none motion-reduce:!transform-none">
                    <a href="#projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                      Scroll Down
                      <svg className={`w-4 h-4 ${showDaisy ? '' : 'animate-bounce motion-reduce:animate-none'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-grid-portrait-desktop relative hidden lg:block lg:translate-y-[30px] origin-right scale-[1.16424]">
              <div data-portrait-target onPointerEnter={() => setHasHoveredPortrait(true)} className="group aspect-square relative overflow-hidden cursor-pointer">
                <DotMatrixPortrait src={siteConfig.portrait} alt={siteConfig.name} resolution={8} dotRadius={2.6} influenceRadius={80} displaceStrength={18} paused={pausePortrait} mirrored />
                {chromeReady && !hasHoveredPortrait && (
                  <svg
                    aria-hidden
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full pointer-events-none motion-reduce:hidden"
                  >
                    <path
                      id="hero-portrait-contour"
                      d="M38.04,99.91 Q38.35,97 38.93,94.95 Q39.51,92.9 41.24,90.86 Q42.98,88.81 45.38,86.76 Q47.79,84.71 48.53,82.66 Q49.27,80.62 52.67,78.57 Q56.08,76.52 56.03,74.47 Q55.98,72.43 55.97,70.38 Q55.95,68.33 55.27,66.28 Q54.58,64.24 52.12,62.19 Q49.66,60.15 48.07,58.10 Q46.48,56.05 44.99,54.00 Q43.5,51.96 43.23,49.91 Q42.97,47.86 43.38,45.81 Q43.78,43.77 46.21,41.72 Q48.64,39.67 50.75,37.63 Q52.85,35.58 55.25,33.53 Q57.66,31.48 58.83,29.44 Q60,27.39 61.00,25.34 Q61.99,23.29 63.98,21.24 Q65.97,19.2 69.39,17.15 L72.82,15.1"
                      fill="none"
                      stroke="none"
                    />
                    <text className="fill-orange-500" style={{ fontSize: '2.6px', letterSpacing: '0.09px', fontFamily: 'var(--font-luckiest-guy), "Arial Black", Impact, sans-serif' }}>
                      <textPath href="#hero-portrait-contour" startOffset="100%">
                        &lt; Hover to Interact &gt;
                        <animate attributeName="startOffset" values="100%;-30%" dur="10s" begin="-3.5s" repeatCount="indefinite" />
                      </textPath>
                    </text>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <DotMatrixBg dotSize={1.5} gap={24} color="#d1d5db" influenceRadius={100} displaceStrength={16}>
        <section id="categories" className="site-page-gutters pt-20 pb-24 lg:pt-64 lg:pb-80">
          <div>
            <div className="mb-12 lg:mb-32">
              <p className="text-sm text-gray-500 mb-4 lg:mb-6 uppercase tracking-wider">Explore by Category</p>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold">Areas of Focus</h2>
            </div>
            <div className="h-4 lg:h-7 bg-transparent" />
            <FocusCards categories={focusCategoryProjects.map((category) => ({
              slug: category.slug,
              name: categoryNames[category.slug],
              heroUrl: projects.find((project) => project.slug === category.heroProjectSlug)?.heroUrl,
            }))} />
          </div>
        </section>
      </DotMatrixBg>

      {/* Spacer between categories and projects */}
      <div className="h-24 lg:h-48 bg-white" />

      {/* Parallax Projects — title is built into the component */}
      <div id="projects" style={{ scrollMarginTop: '80px' }}>
        <ParallaxProjectsSection projects={featuredProjects} categoryDisplayNames={categoryDisplayNames} />
      </div>

      <SiteFooter />
    </div>
  );
}
