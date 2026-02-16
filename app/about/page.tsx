// app/about/page.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { Mail, Linkedin, Github, Download } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation - 144px 边距 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div style={{ paddingLeft: '144px', paddingRight: '144px', paddingTop: '24px', paddingBottom: '24px' }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            
            <div className="flex items-center gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-sm font-medium text-orange-500">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>
    <div className="h-32" />
      {/* Hero Section */}
      <section className="pt-48 pb-48" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left - Text */}
          <div>
            <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">About Me</p>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Designer & <span className="text-orange-500">Developer</span>
            </h1>
            <p className="text-xl text-gray-600 leading-[1.8] mb-10">
              I'm Dingran Dai, a designer-developer bridging urban planning, 
              human-computer interaction, and digital fabrication.
            </p>
            <p className="text-lg text-gray-600 leading-[1.85]">
              Currently pursuing my Master's in Applied Information Science at Cornell Tech, 
              I combine my background in urban planning with computational design to create 
              interactive experiences that bridge physical and digital spaces.
            </p>
          </div>

          {/* Right - Image */}
          <div className="relative flex items-center justify-center">
            <div className="w-[70%] aspect-square relative overflow-hidden bg-gray-100 rounded-lg">
              <Image
                src="/portrait.jpg"
                alt="Dingran Dai"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              {/* Orange accent corners */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-orange-500"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-orange-500"></div>
            </div>
          </div>
        </div>
      </section>
    <div className="h-16" />
      {/* Education & Experience */}
      <section className="pt-48 pb-48 bg-gray-50" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Education */}
          <div>
            <h2 className="text-4xl font-bold mb-12 pb-4 border-b border-gray-200">Education</h2>
            
            <div className="space-y-15">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold">Cornell University</h3>
                    <p className="text-sm text-gray-500">New York, NY</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">Aug 2025 – May 2027</span>
                </div>
                <p className="text-lg text-gray-700 mb-2">Master of Science</p>
                <p className="text-base text-gray-600 mb-3">Applied Information Science & Information System</p>
                <p className="text-sm text-orange-600 font-medium">Merit Scholarship</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">3D Interaction Design</span>
                    <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">Ubiquitous Computing</span>
                    <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">Digital Fabrication</span>
                    <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">HCI</span>
                    <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">Interactive Devices</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold">South China University of Technology</h3>
                    <p className="text-sm text-gray-500">Guangzhou, China</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">Sep 2020 – Jul 2025</span>
                </div>
                <p className="text-lg text-gray-700 mb-2">Bachelor of Engineering</p>
                <p className="text-base text-gray-600 mb-3">Urban & Rural Planning • GPA: 3.72/4.0</p>
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
            <h2 className="text-4xl font-bold mb-12 pb-4 border-b border-gray-200">Experience</h2>
            
            <div className="space-y-10">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold">Product Strategy Intern</h3>
                    <p className="text-sm text-gray-500">Shenzhen, China</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">2025</span>
                </div>
                <p className="text-lg text-gray-700 mb-2">Xiaomi Technology</p>
                <p className="text-base text-gray-600">
                  Contributed to product strategy and user experience research for optimizing Redmi smartphone performance and gaming experience 
                </p>
              </div>

              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold">Urban Data Research Intern</h3>
                    <p className="text-sm text-gray-500">Guangzhou, China</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">2024</span>
                </div>
                <p className="text-lg text-gray-700 mb-2">Architectural Design and Research Institute of SCUT</p>
                <p className="text-base text-gray-600">
                  Scraped Baidu Street View images across 30 cities and used ArcGIS to analyze historical urban landscape pattern
                </p>
              </div>

              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold">Planning Intern</h3>
                    <p className="text-sm text-gray-500">Guangzhou, China</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">2023</span>
                </div>
                <p className="text-lg text-gray-700 mb-2">Guangzhou Urban Planning Survey and Design Research Institute</p>
                <p className="text-base text-gray-600">
                  Conducted site research, developed an evaluation framework, and distributed resident satisfaction surveys to inform urban systems design
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    <div className="h-16" />
    
      {/* Skills */}
      <section className="pt-48 pb-48" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <h2 className="text-4xl font-bold mb-50 text-center">Skills & Expertise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Languages & Development */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-6">Development</h3>
            <ul className="space-y-3 text-gray-600 leading-relaxed">
              <li>Python</li>
              <li>SQL</li>
              <li>JavaScript / TypeScript</li>
              <li>Git / GitHub</li>
              <li>Linux / Bash</li>
            </ul>
          </div>

          {/* Design Tools */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-6">Design</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Figma</li>
              <li>Photoshop / Illustrator</li>
              <li>Fusion 360</li>
              <li>Rhino / Sketchup</li>
              <li>AutoCAD</li>
            </ul>
          </div>

          {/* Hardware & Fabrication */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-6">Physical Computing</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Arduino</li>
              <li>Raspberry Pi</li>
              <li>ESP32 (Feather)</li>
              <li>Sensor Integration</li>
              <li>Laser cutting & 3D Printing</li>
            </ul>
          </div>
        </div>
        </section>

    <div className="h-16" />


      {/* Philosophy */}
      <section className="pt-48 pb-48 bg-gray-50">
        <div
          className="w-full"
          style={{ paddingLeft: '144px', paddingRight: '144px' }}
        >
          <h2 className="text-4xl font-bold mb-20 text-center">
            Design Philosophy
          </h2>

          <p className="text-2xl text-gray-700 leading-relaxed mb-6 text-center">
            "I believe in creating experiences that are both
            <span className="text-orange-500 font-semibold"> thoughtfully designed </span>
            and
            <span className="text-orange-500 font-semibold"> technically grounded</span>."
          </p>

          <p className="text-lg text-gray-600 leading-relaxed text-center">
            My work explores how computational tools can extend human creativity,
            how physical spaces can become interactive, and how design can bridge
            the gap between intention and implementation.
          </p>
        </div>
      </section>

    <div className="h-16" />

      {/* Contact CTA */}
      <section className="pt-48 pb-48">
          <div 
            className="w-full"
            style={{ paddingLeft: '144px', paddingRight: '144px' }}
          >
            <h2 className="text-4xl font-bold mb-10 text-center">
              Let's Connect
            </h2>
            <p className="text-xl text-gray-600 mb-16 text-center">
              I'm always interested in new opportunities, collaborations, and conversations 
              about design and technology.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center justify-center gap-6 mb-16">
              <a
                href="dd699@cornell.edu"
                className="w-16 h-16 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/dingran-dai-4a24a8320/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://github.com/Daidai1031"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
         
          
<div className="h-8" />
            {/* Resume Download */}
            <a
              href="/resume.pdf"
              download
              className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Resume
            </a>
          </div>
        </div>
      </section>
    <div className="h-32" />
      {/* Footer */}
      <footer className="border-t border-gray-200 py-16 bg-gray-50" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
