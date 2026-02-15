'use client'

import Image from "next/image";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";
import { useEffect, useState } from "react";
import { Mail, Github, Linkedin } from "lucide-react";

// 分类显示名称映射
const categoryDisplayNames: Record<string, string> = {
  'hci': 'Computational Interaction',
  'architecture': 'Architecture',
  'fabrication': 'Fabrication',
  'urban-interaction': 'Urban'
};

export default function HomePage() {
  const projects = getAllProjects();
  const featuredProjects = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  // 打字机效果
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = "I'm Dingran Dai";
  const typingSpeed = 100;
  const deletingSpeed = 80;
  const pauseTime = 2000;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === fullText) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
    } else {
      const nextText = isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1);
      
      timeout = setTimeout(() => {
        setDisplayText(nextText);
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation - 整体左右留白 36px */}
      <nav className="fixed top-0 left-9 right-9 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="px-0 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            
            {/* 导航项间距 */}
            <div className="flex items-center gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - 整体左右留白 36px */}
      <section className="min-h-screen flex items-center mx-9 pt-24 pb-40">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-28 items-center">
            {/* 左侧：大标题 */}
            <div>
              <div className="mb-16">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-8">
                  {displayText.split('').map((char, index) => (
                    <span 
                      key={index}
                      className={index === displayText.length - 1 && !isDeleting ? 'text-orange-500' : ''}
                    >
                      {char}
                    </span>
                  ))}
                  <span className="inline-block w-1 h-16 lg:h-20 bg-orange-500 ml-2 animate-pulse align-middle"></span>
                </h1>
              </div>
              
              <div className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
                <p className="mb-0">
                  Former architecture major turned designer–developer,{' '}
                  now exploring interactive technologies at Cornell Tech.
                </p>
              </div>
              
              <p className="text-sm text-gray-400 mb-16 tracking-[0.25em] uppercase">
                Design • Develop • Fabrication
              </p>

              {/* 社交图标 */}
              <div className="flex gap-6 mb-32">
                <a
                  href={`mailto:${siteConfig.social.email}`}
                  className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>

              {/* Scroll Down */}
              <a
                href="#categories"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors group"
              >
                Scroll Down
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* 右侧：照片 */}
            <div className="relative">
              <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-sm">
                <Image
                  src={siteConfig.portrait}
                  alt={siteConfig.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  priority
                />
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-orange-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-orange-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - 整体左右留白 36px */}
      <section id="categories" className="py-40 mx-9 bg-gray-50">
        <div className="w-full">
          {/* 标题左对齐 */}
          <div className="mb-20">
            <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">Explore by Category</p>
            <h2 className="text-5xl md:text-6xl font-bold">Areas of Focus</h2>
          </div>
          
          {/* 四个分类 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Computational Interaction', slug: 'hci', count: projects.filter(p => p.category === 'hci').length },
              { name: 'Architecture', slug: 'architecture', count: projects.filter(p => p.category === 'architecture').length },
              { name: 'Fabrication', slug: 'fabrication', count: projects.filter(p => p.category === 'fabrication').length },
              { name: 'Urban', slug: 'urban-interaction', count: projects.filter(p => p.category === 'urban-interaction').length }
            ].map((category, index) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative bg-white rounded-lg p-10 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-orange-500"
              >
                <span className="absolute top-8 right-8 text-7xl font-bold text-gray-100 group-hover:text-orange-100 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </span>
                
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-4 group-hover:text-orange-500 transition-colors leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-8">
                    {category.count} {category.count === 1 ? 'Project' : 'Projects'}
                  </p>
                  
                  <div className="flex items-center text-sm text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="pt-48 pb-32 mx-9">
        {/* 标题区域 - 整体左右留白 36px */}
        <div className="mb-28">
          <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">Portfolio</p>
          <h2 className="text-5xl md:text-6xl font-bold">
            SELECTED <span className="text-orange-500">WORKS</span>
          </h2>
        </div>
        
        {/* 横向滚动容器 - 与页面整体留白对齐 */}
        <div className="relative">
          <div className="horizontal-scroll pb-4">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.slug}
                href={project.url}
                className="group flex-shrink-0 w-[460px] opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className="relative aspect-[4/3] bg-gray-100 mb-6 overflow-hidden rounded-lg">
                  {project.heroUrl ? (
                    <Image
                      src={project.heroUrl}
                      alt={project.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                  
                  <div className="absolute top-6 left-6 text-7xl font-bold text-white/20 group-hover:text-orange-500/30 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                      {categoryDisplayNames[project.category] || project.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {project.year}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold group-hover:text-orange-500 transition-colors leading-tight">
                    {project.title}
                  </h3>
                  
                  {project.subtitle && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {project.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            ))}
            
            {/* View All Projects */}
            <div className="flex-shrink-0 w-[460px] flex items-center justify-center">
              <Link
                href="/projects"
                className="group relative w-full aspect-[4/3] flex flex-col items-center justify-center border-2 border-gray-300 hover:border-orange-500 transition-all rounded-lg bg-white hover:bg-gray-50 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full translate-y-16 -translate-x-16"></div>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="mb-6 inline-flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-300 group-hover:border-orange-500 flex items-center justify-center transition-all group-hover:scale-110">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-orange-500 transition-colors">
                      View All Projects
                    </p>
                    <p className="text-sm text-gray-500">
                      Explore the complete portfolio
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="text-center mt-20 text-sm text-gray-400 flex items-center justify-center gap-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Scroll to explore
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </section>

      {/* Footer - 整体左右留白 36px */}
      <footer className="border-t border-gray-200 py-16 mx-9 bg-gray-50 mt-24">
        <div className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Dingran Dai. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href={`mailto:${siteConfig.social.email}`} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                Email
              </a>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                LinkedIn
              </a>
              <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}