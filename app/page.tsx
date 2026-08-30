'use client'

import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";
import { useEffect, useState } from "react";
import { Mail, Github, Linkedin, Menu, X } from "lucide-react";
import DotMatrixPortrait from "@/components/DotMatrixPortrait";
import IntroOverlay from "@/components/IntroOverlay";
import ParallaxProjectsSection from "@/components/ParallaxProjectsSection";
import DotMatrixBg from "@/components/DotMatrixBg";
import SectionNav from "@/components/SectionNav";
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

export default function HomePage() {
  const projects = getAllProjects();
  const featuredProjects = featuredProjectSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phase, setPhase] = useState<'pending' | 'intro' | 'ready' | 'instant'>('pending');
  const introDone = phase === 'ready' || phase === 'instant';
  const fullText = "Hi, I'm Dingran :)";

  // Opening plays once per session, and never for reduced-motion visitors.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let played = false;
      try { played = sessionStorage.getItem('intro-played') === '1'; } catch {}
      if (reduced || played) { setPhase('instant'); return; }
      try { sessionStorage.setItem('intro-played', '1'); } catch {}
      setPhase('intro');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!introDone) return;
    let timeout: NodeJS.Timeout;
    if (!isDeleting && displayText === fullText) {
      timeout = setTimeout(() => setIsDeleting(true), 5000);
    } else if (isDeleting && displayText === "") {
      timeout = setTimeout(() => setIsDeleting(false), 0);
    } else {
      const next = isDeleting ? fullText.substring(0, displayText.length - 1) : fullText.substring(0, displayText.length + 1);
      timeout = setTimeout(() => setDisplayText(next), isDeleting ? 90 : 62);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, introDone]);

  // Staggered entrance for everything that follows the typed line.
  const reveal = (delay: number): React.CSSProperties =>
    phase === 'instant'
      ? { opacity: 1 }
      : {
          opacity: introDone ? 1 : 0,
          transform: introDone ? 'none' : 'translateY(14px)',
          transition: `opacity 700ms ease-out ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        };

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
        <IntroOverlay src={siteConfig.portrait} onDone={() => setPhase('ready')} />
      )}
      <SectionNav />
      {/* Nav */}
      <nav data-reveal className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50" style={reveal(0)}>
        <div className="px-6 py-4 lg:py-6" style={{ paddingLeft:'clamp(24px,12vw,180px)', paddingRight:'clamp(24px,8vw,120px)' }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg lg:text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">DINGRAN DAI</Link>
            <div className="hidden md:flex items-center gap-8 lg:gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">Projects</Link>
              <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">About</Link>
              <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 transition-colors">Contact</Link>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 flex flex-col gap-4" style={{ paddingLeft:'clamp(24px, 12vw, 180px)', paddingRight:'clamp(24px, 12vw, 180px)' }}>
            <Link href="/projects" className="text-sm font-medium hover:text-orange-500 py-2" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
            <Link href="/about" className="text-sm font-medium hover:text-orange-500 py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="hero" className="min-h-screen flex items-center pt-50 pb-20 lg:pt-32 lg:pb-48"
        style={{ paddingLeft:'clamp(24px,12vw,180px)', paddingRight:'clamp(24px,8vw,120px)' }}>
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
            <div className="relative lg:hidden">
              <div data-portrait-target className="group aspect-square relative overflow-hidden bg-gray-100 max-w-xs mx-auto cursor-pointer">
                <DotMatrixPortrait src={siteConfig.portrait} alt={siteConfig.name} resolution={6} dotRadius={2.5} influenceRadius={60} displaceStrength={14} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6 lg:mb-8">
                {displayText.split('').map((char, i) => (
                  <span key={i} className={i === displayText.length - 1 && !isDeleting ? 'text-orange-500' : ''}>{char}</span>
                ))}
                <span className="inline-block w-1 h-10 lg:h-20 bg-orange-500 ml-2 animate-pulse align-middle"></span>
              </h1>
              <p data-reveal style={reveal(640)} className="text-base lg:text-xl text-gray-600 mb-6 max-w-1.4xl leading-relaxed">
                Designer and technologist with a background in architecture, building interactive products through AI, physical computing, and rapid prototyping at Cornell Tech.
              </p>
              <p data-reveal style={reveal(800)} className="text-xs lg:text-sm text-gray-400 mb-8 tracking-[0.25em] uppercase">Design • Develop • Fabrication</p>
              <div data-reveal style={reveal(960)} className="flex gap-4 lg:gap-6 mb-10">
                <a href={`mailto:${siteConfig.social.email}`} className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"><Mail className="w-4 h-4 lg:w-5 lg:h-5" /></a>
                <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"><Linkedin className="w-4 h-4 lg:w-5 lg:h-5" /></a>
                <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"><Github className="w-4 h-4 lg:w-5 lg:h-5" /></a>
              </div>
              <div data-reveal style={reveal(1120)}>
                <a href="#projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                  Scroll Down
                  <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div data-portrait-target className="group aspect-square relative overflow-hidden bg-gray-100 cursor-pointer">
                <DotMatrixPortrait src={siteConfig.portrait} alt={siteConfig.name} resolution={8} dotRadius={3} influenceRadius={80} displaceStrength={18} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <DotMatrixBg className="pt-20 pb-24 lg:pt-64 lg:pb-80" dotSize={1.5} gap={24} color="#d1d5db" influenceRadius={100} displaceStrength={16}>
        <section id="categories" className="pt-20 pb-24 lg:pt-64 lg:pb-80"
          style={{ paddingLeft:'clamp(24px,12vw,180px)', paddingRight:'clamp(24px,8vw,120px)' }}>
          <div>
            <div className="mb-12 lg:mb-32">
              <p className="text-sm text-gray-500 mb-4 lg:mb-6 uppercase tracking-wider">Explore by Category</p>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold">Areas of Focus</h2>
            </div>
            <div className="h-4 lg:h-7 bg-transparent" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-12">
              {[
                { name:categoryNames['physical-computing'], slug:'physical-computing', count:projects.filter(p=>p.category==='physical-computing').length },
                { name:categoryNames['ai-digital-products'], slug:'ai-digital-products', count:projects.filter(p=>p.category==='ai-digital-products').length },
                { name:categoryNames['creative-media'], slug:'creative-media', count:projects.filter(p=>p.category==='creative-media').length },
                { name:categoryNames['architecture-fabrication'], slug:'architecture-fabrication', count:projects.filter(p=>p.category==='architecture-fabrication').length }
              ].map((cat, index) => (
                <Link
                  key={cat.slug}
                  href={`/projects?category=${cat.slug}`}
                  className="group relative bg-white border border-gray-200 hover:border-orange-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col items-center justify-center text-center p-5 lg:p-7 min-h-[110px] lg:min-h-[140px] overflow-visible"
                >
                  {/* Diagonal corner brackets — behind the number */}
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 w-3 h-3 lg:w-4 lg:h-4 border-t-[2px] border-l-[1.5px] border-orange-500 z-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-x-[6px] group-hover:-translate-y-[6px]"
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 w-3 h-3 lg:w-4 lg:h-4 border-b-[1.5px] border-r-[1.5px] border-orange-500 z-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[6px] group-hover:translate-y-[6px]"
                  />

                  {/* Big bottom-right number — sits outside the card, on top of brackets */}
                  <span
                    aria-hidden
                    className="absolute -bottom-2 -right-3 lg:-bottom-8 lg:-right-0 text-4xl lg:text-8xl font-bold leading-none text-gray-100 group-hover:text-orange-100 transition-colors duration-300 select-none pointer-events-none tabular-nums z-50"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Content — centered */}
                  <div className="relative z-10">
                    <h3 className="text-sm lg:text-lg font-semibold leading-tight group-hover:text-orange-500 transition-colors mb-1.5 lg:mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500">
                      {cat.count} {cat.count === 1 ? 'Project' : 'Projects'}
                    </p>
                    <div className="hidden lg:flex items-center justify-center mt-3 text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore
                      <svg className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>    
              ))}
            </div>
          </div>
        </section>
      </DotMatrixBg>

      {/* Spacer between categories and projects */}
      <div className="h-24 lg:h-48 bg-white" />

      {/* Parallax Projects — title is built into the component */}
      <div id="projects" style={{ scrollMarginTop: '80px' }}>
        <ParallaxProjectsSection projects={featuredProjects} categoryDisplayNames={categoryDisplayNames} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50"
        style={{ paddingLeft:'clamp(24px,12vw,180px)', paddingRight:'clamp(24px,8vw,120px)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <div className="flex gap-6 lg:gap-8">
            <a href={`mailto:${siteConfig.social.email}`} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">Email</a>
            <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">LinkedIn</a>
            <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
