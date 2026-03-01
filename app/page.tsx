'use client'

import Image from "next/image";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";
import { useEffect, useState } from "react";
import { Mail, Github, Linkedin, Menu, X } from "lucide-react";
import DotMatrixPortrait from "@/components/DotMatrixPortrait";
import ParallaxProjectsSection from "@/components/ParallaxProjectsSection";
import DotMatrixBg from "@/components/DotMatrixBg";
import SectionNav from "@/components/SectionNav";

const categoryDisplayNames: Record<string, string> = {
  'hci': 'Computational Interaction',
  'architecture': 'Architecture',
  'fabrication': 'Fabrication',
  'urban-interaction': 'Urban'
};
const categoryOrder = ['hci', 'fabrication', 'urban-interaction', 'architecture'];

export default function HomePage() {
  const projects = getAllProjects();
  const allProjectsSorted = [...projects].sort((a, b) => {
    const catA = categoryOrder.indexOf(a.category);
    const catB = categoryOrder.indexOf(b.category);
    if (catA !== catB) return (catA === -1 ? 999 : catA) - (catB === -1 ? 999 : catB);
    const orderDiff = (a.order ?? 9999) - (b.order ?? 9999);
    if (orderDiff !== 0) return orderDiff;
    return (b.year ?? 0) - (a.year ?? 0);
  });

  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fullText = "Hi, I'm Dingran :)";

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isDeleting && displayText === fullText) {
      timeout = setTimeout(() => setIsDeleting(true), 5000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
    } else {
      const next = isDeleting ? fullText.substring(0, displayText.length - 1) : fullText.substring(0, displayText.length + 1);
      timeout = setTimeout(() => setDisplayText(next), isDeleting ? 90 : 50);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <div className="min-h-screen bg-white text-black">
      <SectionNav />
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
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
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            <Link href="/projects" className="text-sm font-medium hover:text-orange-500 py-2" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
            <Link href="/about" className="text-sm font-medium hover:text-orange-500 py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="hero" className="min-h-screen flex items-center pt-50 pb-20 lg:pt-24 lg:pb-64"
        style={{ paddingLeft:'clamp(24px,12vw,180px)', paddingRight:'clamp(24px,8vw,120px)' }}>
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
            <div className="relative lg:hidden">
              <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-sm max-w-xs mx-auto">
                <DotMatrixPortrait src={siteConfig.portrait} alt={siteConfig.name} resolution={6} dotRadius={2.5} influenceRadius={60} displaceStrength={14} />
              </div>
            </div>
            <div>
              <div className="mb-10 lg:mb-16">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-8">
                  {displayText.split('').map((char, i) => (
                    <span key={i} className={i === displayText.length - 1 && !isDeleting ? 'text-orange-500' : ''}>{char}</span>
                  ))}
                  <span className="inline-block w-1 h-10 lg:h-20 bg-orange-500 ml-2 animate-pulse align-middle"></span>
                </h1>
              </div>
              <div className="h-3 lg:h-6" />
              <p className="text-base lg:text-xl text-gray-600 mb-14 lg:mb-8 max-w-1.4xl leading-relaxed">
                Former architecture major who loves making and prototyping, now exploring more interactive technologies at Cornell Tech.
              </p>
              <div className="h-1 lg:h-2" />
              <p className="text-xs lg:text-sm text-gray-400 mb-14 lg:mb-16 tracking-[0.25em] uppercase">Design • Develop • Fabrication</p>
              <div className="h-3 lg:h-6" />
              <div className="flex gap-4 lg:gap-6 mb-14 lg:mb-32">
                <a href={`mailto:${siteConfig.social.email}`} className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"><Mail className="w-4 h-4 lg:w-5 lg:h-5" /></a>
                <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"><Linkedin className="w-4 h-4 lg:w-5 lg:h-5" /></a>
                <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"><Github className="w-4 h-4 lg:w-5 lg:h-5" /></a>
              </div>
              <div className="h-5 lg:h-8" />
              <a href="#projects" className="mt-10 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                Scroll Down
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </a>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-sm">
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
                { name:'Computational Interaction', slug:'hci', count:projects.filter(p=>p.category==='hci').length },
                { name:'Architecture', slug:'architecture', count:projects.filter(p=>p.category==='architecture').length },
                { name:'Fabrication', slug:'fabrication', count:projects.filter(p=>p.category==='fabrication').length },
                { name:'Urban', slug:'urban-interaction', count:projects.filter(p=>p.category==='urban-interaction').length }
              ].map((cat, index) => (
                <Link key={cat.slug} href={`/projects#${cat.slug}`}
                  className="group relative bg-white rounded-lg p-6 lg:p-12 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-orange-500 flex items-center justify-center min-h-[140px] lg:min-h-0">
                  <span className="absolute top-4 right-4 lg:top-8 lg:right-8 text-4xl lg:text-7xl font-bold text-gray-100 group-hover:text-orange-100 transition-colors">{String(index+1).padStart(2,'0')}</span>
                  <div className="relative z-10 text-center w-full">
                    <h3 className="text-sm lg:text-lg font-semibold mb-2 lg:mb-6 group-hover:text-orange-500 transition-colors leading-tight">{cat.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-500 mb-4 lg:mb-10">{cat.count} {cat.count===1?'Project':'Projects'}</p>
                    <div className="hidden lg:flex items-center justify-center text-sm text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
        <ParallaxProjectsSection projects={allProjectsSorted} categoryDisplayNames={categoryDisplayNames} />
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