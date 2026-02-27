// app/about/page.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { Mail, Linkedin, Github, Download, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_PADDING = "clamp(24px, 10vw, 144px)";

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="py-4 lg:py-6" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg lg:text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            
            <div className="hidden md:flex items-center gap-8 lg:gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-sm font-medium text-orange-500">
                About
              </Link>
              <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            <Link href="/projects" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
            <Link href="/about" className="text-sm font-medium text-orange-500 py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/about#connect" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </nav>

      <div className="h-16 lg:h-32" />

      {/* Hero Section */}
      <section
        className="pt-12 pb-16 lg:pt-48 lg:pb-48"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Mobile: image first */}
          <div className="relative flex items-center justify-center lg:hidden">
            <div className="w-56 h-56 sm:w-72 sm:h-72 relative overflow-hidden bg-gray-100 rounded-lg">
              <Image
                src="/portrait.jpg"
                alt="Dingran Dai"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-orange-500"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-orange-500"></div>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-sm text-gray-500 mb-3 lg:mb-4 uppercase tracking-wider">About Me</p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 lg:mb-8 leading-tight">
              Dingran <span className="text-orange-500">Dai</span>
            </h1>
            <p className="text-base lg:text-xl text-gray-700 leading-[1.85] mb-6 lg:mb-10">
{/* I’m Dingran Dai, with a background in urban Design, working through hands-on making and prototyping. */}
            </p>
            <p className="text-sm lg:text-lg text-gray-600 leading-[1.85]">
Currently pursuing my Master’s in Applied Information Science at Cornell Tech, I draw on my background in architecture and computational design to make and prototype interactive experiences.
            </p>
          </div>

          {/* Desktop: image right */}
          <div className="relative items-center justify-center hidden lg:flex">
            <div className="w-[70%] aspect-square relative overflow-hidden bg-gray-100 rounded-lg">
              <Image
                src="/portrait.jpg"
                alt="Dingran Dai"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-orange-500"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-orange-500"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-8 lg:h-16" />

      {/* Education & Experience */}
      <section
        className="pt-12 pb-16 lg:pt-48 lg:pb-48 bg-gray-50"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Education */}
          <div>
            <h2 className="text-2xl lg:text-4xl font-bold mb-8 lg:mb-12 pb-4 border-b border-gray-200">Education</h2>
            
            <div className="space-y-10">
              <div>
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold">Cornell University</h3>
                    <p className="text-sm text-gray-500">New York, NY</p>
                  </div>
                  <span className="text-sm text-gray-500">Aug 2025 – May 2027</span>
                </div>
                <p className="text-base lg:text-lg text-gray-700 mb-2">Master of Science</p>
                <p className="text-sm lg:text-base text-gray-600 mb-3">Applied Information Science & Information System</p>
                <p className="text-sm text-orange-600 font-medium">Merit Scholarship</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    {['3D Interaction Design', 'Ubiquitous Computing', 'Digital Fabrication', 'HCI', 'Interactive Devices'].map(c => (
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
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-2xl lg:text-4xl font-bold mb-8 lg:mb-12 pb-4 border-b border-gray-200">Experience</h2>
            
            <div className="space-y-8 lg:space-y-10">
              {[
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
        </div>
      </section>

      <div className="h-8 lg:h-16" />
    
      {/* Skills */}
      <section
        className="pt-12 pb-16 lg:pt-48 lg:pb-48"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <h2 className="text-2xl lg:text-4xl font-bold mb-10 lg:mb-16 text-center">Skills & Expertise</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
          {[
            {
              icon: (
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              ),
              title: 'Development',
              items: ['Python', 'SQL', 'JavaScript / TypeScript', 'Git / GitHub', 'Linux / Bash']
            },
            {
              icon: (
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              ),
              title: 'Design',
              items: ['Figma', 'Photoshop / Illustrator', 'Fusion 360', 'Rhino / Sketchup', 'AutoCAD']
            },
            {
              icon: (
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              ),
              title: 'Physical Computing',
              items: ['Arduino', 'Raspberry Pi', 'ESP32 (Feather)', 'Sensor Integration', 'Laser cutting & 3D Printing']
            }
          ].map((skill) => (
            <div key={skill.title} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-5 lg:mb-6">
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
      <section className="pt-12 pb-16 lg:pt-48 lg:pb-48 bg-gray-50">
        <div style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
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
      <section id="connect" className="pt-12 pb-16 lg:pt-48 lg:pb-48">
        <div className="w-full" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <h2 className="text-2xl lg:text-4xl font-bold mb-6 lg:mb-10 text-center">Let's Connect</h2>
          <p className="text-base lg:text-2xl text-gray-700 mb-10 lg:mb-16 text-center mx-auto">
            I'm currently looking for Summer Internship opportunities in the tech, design, or digital fabrication space, as well as Research Assistant roles related to interactive systems and prototyping.
          </p>
          <div className="h-8" />
          <div className="flex items-center justify-center gap-4 lg:gap-6 mb-10 lg:mb-16 flex-wrap ">
            <a
              href="mailto:dd699@cornell.edu"
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/dingran-dai-4a24a8320/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 lg:w-6 lg:h-6" />
            </a>
            <a
              href="https://github.com/Daidai1031"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 lg:w-6 lg:h-6" />
            </a>
          </div>
          <div className="h-8" />
          <div className="flex justify-center">
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-3 px-6 py-3 lg:px-8 lg:py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors text-sm lg:text-base"
            >
              <Download className="w-4 h-4 lg:w-5 lg:h-5" />
              Download Resume
            </a>
          </div>
        </div>
      </section>

      <div className="h-8 lg:h-32" />

      {/* Footer */}
      <footer
        className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}