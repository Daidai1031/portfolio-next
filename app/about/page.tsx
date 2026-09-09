// app/about/page.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, Linkedin, Github } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SectionNav from "@/components/SectionNav";
import DaisyDotFlower from "@/components/DaisyDotFlower";

const aboutSections = [
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "philosophy", label: "Philosophy" },
  { id: "connect", label: "Connect" },
];

function HeroPortrait({ sizeClassName }: { sizeClassName: string }) {
  // Once hovered, the daisy stays bloomed — no shrink-back on mouse leave.
  const [bloomed, setBloomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);

  // Gentle sway toward the cursor, independent of the bloom scale/opacity
  // transition above — driven imperatively so it doesn't fight the
  // Tailwind-class transform with a React re-render every frame.
  useEffect(() => {
    const container = containerRef.current;
    const sway = swayRef.current;
    if (!container || !sway) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let mouse: { x: number; y: number } | null = null;
    let rot = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mouse = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouse = null;
    };

    const frame = () => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let targetRot = 0;
      let targetTx = 0;
      let targetTy = 0;
      if (mouse && rect.width > 0 && rect.height > 0) {
        const dx = Math.max(-1, Math.min(1, (mouse.x - cx) / (rect.width / 2)));
        const dy = Math.max(-1, Math.min(1, (mouse.y - cy) / (rect.height / 2)));
        targetRot = dx * 6;
        targetTx = dx * 5;
        targetTy = dy * 5;
      }
      rot += (targetRot - rot) * 0.08;
      tx += (targetTx - tx) * 0.08;
      ty += (targetTy - ty) * 0.08;
      sway.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`about-reveal-portrait relative overflow-hidden rounded-full ${sizeClassName}`}
      style={{ animationDelay: "260ms" }}
      onMouseEnter={() => setBloomed(true)}
    >
      {/* Gray base sits at the bottom, same footprint as the portrait. The
          daisy sits above it, shrunk to nothing until first hovered; then it
          blooms and stays bloomed, clipped to this same gray disc so it
          never spills past the rim. The portrait — same size/position as
          the gray base, always — is the top layer and never changes. */}
      <div className="absolute inset-0 rounded-full bg-gray-100" />
      <div
        className={`pointer-events-none absolute inset-0 origin-center transition-all duration-500 ease-out motion-reduce:transition-none ${
          bloomed ? "opacity-100 scale-[0.94]" : "opacity-0 scale-0"
        }`}
      >
        <div ref={swayRef} className="w-full h-full motion-reduce:!transform-none" style={{ willChange: 'transform' }}>
          <DaisyDotFlower className="w-full h-full" />
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <Image
          src="/portrait-about.jpg"
          alt="Dingran Dai"
          fill
          className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <SiteHeader />
      <SectionNav sections={aboutSections} fadeItems />

      <div className="h-28 lg:h-32" />

      {/* Hero Section */}
      <section
        className="site-page-gutters pt-12 pb-16 lg:pt-48 lg:pb-48"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center lg:items-end">
          {/* Mobile: image first */}
          <div className="relative flex items-center justify-center lg:hidden">
            <HeroPortrait sizeClassName="w-56 h-56 sm:w-72 sm:h-72" />
          </div>

          {/* Text */}
          <div className="about-reveal-text">
            <p className="text-sm text-gray-500 mb-3 lg:mb-4 uppercase tracking-wider">About Me</p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 lg:mb-8 leading-tight">
              Dingran Dai {" "}
              <span className="text-lg sm:text-xl lg:text-3xl font-medium text-orange-500 align-text-bottom -translate-y-2 sm:-translate-y-2.5 lg:-translate-y-3 inline-block">
                (Daisy)
              </span>
            </h1>
            <p className="text-base lg:text-xl text-gray-700 leading-[1.85] mb-6 lg:mb-10">
{/* I’m Dingran Dai, with a background in urban Design, working through hands-on making and prototyping. */}
            </p>
            <p className="text-sm lg:text-lg text-gray-600 leading-[1.85]">
Currently pursuing my Master’s in Applied Information Science at Cornell Tech, I draw on my background in architecture and computational design to make and prototype interactive experiences.
            </p>
          </div>

          {/* Desktop: image right, bottom-aligned with the text column */}
          <div className="relative items-center justify-center hidden lg:flex">
            <HeroPortrait sizeClassName="w-[70%] aspect-square" />
          </div>
        </div>
      </section>

      <div className="h-8 lg:h-16" />

      {/* Education */}
      <section
        id="education"
        className="site-page-gutters scroll-mt-24 lg:scroll-mt-28 pt-12 pb-16 lg:pt-40 lg:pb-40 bg-gray-50"
      >
        <div>
          <h2 className="text-2xl lg:text-4xl font-bold mb-8 lg:mb-12 pb-4 border-b border-gray-200">Education</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-10">
            <div>
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold">Cornell University</h3>
                  <p className="text-sm text-gray-500">New York, NY</p>
                </div>
                <span className="text-sm text-gray-500">Aug 2025 – May 2027</span>
              </div>
              <p className="text-base lg:text-lg text-gray-700 mb-2">Master of Science</p>
              <p className="text-sm lg:text-base text-gray-600 mb-3">Applied Information Science & Information System • GPA: 4.01/4.2 </p>
              <p className="text-sm text-orange-500 font-medium">Merit Scholarship</p>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Relevant Coursework:</p>
                <div className="flex flex-wrap gap-2">
                  {['3D Interaction Design', 'Ubiquitous Computing', 'Digital Fabrication', 'HCI', 'Interactive Devices', 'Applied Machine Learning', 'Data Structures and Algorithms', 'Trust and Safety'].map(c => (
                    <span key={c} className="text-xs bg-gray-200 px-3 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold">South China University of Technology</h3>
                  <p className="text-sm text-gray-500">Guangzhou, China</p>
                </div>
                <span className="text-sm text-gray-500">Sep 2020 – Jul 2025</span>
              </div>
              <p className="text-base lg:text-lg text-gray-700 mb-2">Bachelor of Engineering</p>
              <p className="text-sm lg:text-base text-gray-600 mb-3">Urban & Rural Planning • GPA: 3.72/4.0</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">• University Scholarship</p>
                <p className="text-sm text-gray-600">• Merit Student in School of Architecture</p>
                <p className="text-sm text-gray-600">• Outstanding Student Leader</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Relevant Coursework:</p>
                <div className="flex flex-wrap gap-2">
                  {['Architecture Studio', 'Sketch Painting', 'Architectural History', 'GIS', 'Urban Design'].map(c => (
                    <span key={c} className="text-xs bg-gray-200 px-3 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl lg:text-2xl font-bold mt-14 lg:mt-20 mb-8 lg:mb-10 pb-4 border-b border-gray-200">Extended Education</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-10">
            {[
              {
                school: 'University of Pennsylvania',
                program: 'Essential Competencies for Innovative Talents',
                location: 'Philadelphia, PA',
                dates: 'Jan 2024 – Feb 2024',
                bullets: [
                  'Engaged in advanced training on Innovation & Technology and Leadership Team Building; earned A rating'
                ]
              },
              {
                school: 'The Chinese University of Hong Kong',
                program: 'Sustainable Urban Futures: Designing for Climate Resilience and Adaptation',
                location: 'Hong Kong',
                dates: 'Jul 2024 – Aug 2024',
                bullets: [
                  'Mastered basics of CFD environmental simulation software; earned A rating'
                ]
              }
            ].map((ext) => (
              <div key={ext.school}>
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold">{ext.school}</h3>
                    <p className="text-sm text-gray-500">{ext.location}</p>
                  </div>
                  <span className="text-sm text-gray-500">{ext.dates}</span>
                </div>
                <p className="text-base lg:text-lg text-gray-700 mb-3">{ext.program}</p>
                <div className="space-y-1">
                  {ext.bullets.map(b => (
                    <p key={b} className="text-sm text-gray-600">• {b}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-8 lg:h-16" />

      {/* Experience */}
      <section
        id="experience"
        className="site-page-gutters scroll-mt-24 lg:scroll-mt-28 pt-12 pb-16 lg:pt-40 lg:pb-40 bg-white"
      >
        <div>
          <h2 className="text-2xl lg:text-4xl font-bold mb-8 lg:mb-12 pb-4 border-b border-gray-200">Experience</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-8 lg:gap-y-10">
            {[
              {
                title: 'AI Automation & Growth Intern',
                location: 'Remote',
                year: '2026',
                company: 'The Style That Binds Us',
                desc: 'Translated founder requirements into a phased roadmap and built an AI wardrobe-planning product using Next.js, TypeScript, Supabase, and Vercel'
              },
              {
                title: 'Product Strategy Intern',
                location: 'Shenzhen, China',
                year: '2025',
                company: 'Xiaomi Technology',
                desc: 'Contributed to product strategy and user experience research for optimizing Redmi smartphone performance and gaming experience'
              },
              {
                title: 'Urban Data Research Intern',
                location: 'Guangzhou, China',
                year: '2024',
                company: 'Architectural Design and Research Institute of SCUT',
                desc: 'Scraped Baidu Street View images across 30 cities and used ArcGIS to analyze historical urban landscape pattern'
              },
              {
                title: 'Planning Intern',
                location: 'Guangzhou, China',
                year: '2023',
                company: 'Guangzhou Urban Planning Survey and Design Research Institute',
                desc: 'Conducted site research, developed an evaluation framework, and distributed resident satisfaction surveys to inform urban systems design'
              }
            ].map((exp) => (
              <div key={exp.title}>
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold">{exp.title}</h3>
                    <p className="text-sm text-gray-500">{exp.location}</p>
                  </div>
                  <span className="text-sm text-gray-500">{exp.year}</span>
                </div>
                <p className="text-base lg:text-lg text-gray-700 mb-2">{exp.company}</p>
                <p className="text-sm lg:text-base text-gray-600">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-8 lg:h-16" />
    
      {/* Skills */}
      <section
        id="skills"
        className="site-page-gutters scroll-mt-24 lg:scroll-mt-28 pt-12 pb-16 lg:pt-48 lg:pb-48 bg-gray-50"
      >
        <h2 className="text-2xl lg:text-4xl font-bold mb-10 lg:mb-16 text-center">Skills & Expertise</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
          {[
            {
              icon: (
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              ),
              title: 'Development',
              items: ['Python', 'SQL', 'JavaScript / TypeScript', 'Git / GitHub', 'Linux / Bash']
            },
            {
              icon: (
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              ),
              title: 'Design',
              items: ['Figma', 'Photoshop / Illustrator', 'Fusion 360', 'Rhino / Sketchup', 'AutoCAD']
            },
            {
              icon: (
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              ),
              title: 'Physical Computing',
              items: ['Arduino', 'Raspberry Pi', 'ESP32 (Feather)', 'Sensor Integration', 'Laser cutting & 3D Printing']
            }
          ].map((skill) => (
            <div key={skill.title} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white border-2 border-orange-500 rounded-full flex items-center justify-center mb-5 lg:mb-6">
                {skill.icon}
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6">{skill.title}</h3>
              <ul className="space-y-2 text-sm lg:text-base text-gray-600">
                {skill.items.map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="h-8 lg:h-16" />

      {/* Philosophy */}
      <section id="philosophy" className="scroll-mt-24 lg:scroll-mt-28 pt-12 pb-16 lg:pt-48 lg:pb-48 bg-white">
        <div className="site-page-gutters">
          <h2 className="text-2xl lg:text-4xl font-bold mb-8 lg:mb-20 text-center">Design Philosophy</h2>
          <p className="text-lg lg:text-2xl text-gray-700 leading-relaxed mb-6 text-center">
            I focus on 
            <span className="text-orange-500 font-semibold"> space </span>
            and how people
            <span className="text-orange-500 font-semibold"> actively interactd</span> with it.
          </p>
          <p className="text-sm lg:text-lg text-gray-600 leading-relaxed text-center">
            Through hands-on making, I explore how subtle interventions can change how people perceive, understand, and move through space.
          </p>
        </div>
      </section>

      <div className="h-8 lg:h-16" />

      {/* Contact CTA */}
      <section id="connect" className="relative overflow-hidden scroll-mt-24 bg-gray-50 pt-12 pb-16 lg:scroll-mt-28 lg:pt-48 lg:pb-48">
        <div aria-hidden className="about-connect-flower">
          <DaisyDotFlower
            className="size-full"
            primaryColor="#ffffff"
            secondaryColor="#d1d5db"
            accentColor="var(--color-orange-500)"
          />
        </div>
        <div className="site-page-gutters relative z-10 w-full">
          <h2 className="text-2xl lg:text-4xl font-bold mb-6 lg:mb-10 text-center">Let&apos;s Connect</h2>
          <p className="text-base lg:text-2xl text-gray-700 mb-10 lg:mb-16 text-center mx-auto">
            I&apos;m currently seeking full-time opportunities starting in 2027, particularly in creative technology, design engineering, and product management. I&apos;m also open to research collaborations involving interactive systems, AI, and hands-on prototyping.
          </p>
          <div className="h-8" />
          <div className="flex items-center justify-center gap-4 lg:gap-6 mb-10 lg:mb-16 flex-wrap ">
            <a
              href="mailto:dd699@cornell.edu"
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/dingran-dai-4a24a8320/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 lg:w-6 lg:h-6" />
            </a>
            <a
              href="https://github.com/Daidai1031"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 lg:w-6 lg:h-6" />
            </a>
          </div>
          <div className="h-8" />
          <div className="flex justify-center">
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="site-footer site-page-gutters py-14 lg:py-20"
      >
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row lg:gap-8">
          <p className="site-footer-signature">Dingran Dai © {new Date().getFullYear()}</p>
          <Link href="/" className="site-footer-link">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
