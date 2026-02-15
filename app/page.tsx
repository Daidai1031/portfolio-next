'use client'

import Image from "next/image";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";
import { useEffect, useState } from "react";
import { Mail, Github, Linkedin } from "lucide-react";

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
      {/* Navigation - 添加左右边距 */}
      <nav className="fixed top-10 left-30 right-30 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="w-full px-14 md:px-16 lg:px-20 xl:px-24 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            DINGRAN DAI
          </Link>
          
          <div className="flex items-center gap-8">
            <Link href="/projects" className="text-sm hover:text-orange-500 transition-colors">
              Projects
            </Link>
            <Link href="/about" className="text-sm hover:text-orange-500 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm hover:text-orange-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-12 md:px-16 lg:px-20 xl:px-24 pt-20">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* 左侧：大标题 - 允许换行 */}
            <div>
              <div className="mb-8">
                {/* 打字机效果 - 可以换行 */}
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-4">
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
              
              {/* 描述 - 自动换行对齐 */}
              <div className="text-xl text-gray-600 mb-3 max-w-lg leading-relaxed">
                <p className="mb-0">
                  Former architecture major turned designer–developer,{' '}
                  now exploring interactive technologies at Cornell Tech.
                </p>
              </div>
              
              <p className="text-sm text-gray-400 mb-15 tracking-[0.1em]">
                design • develop • fabrication
              </p>

              {/* 社交图标 */}
              <div className="flex gap-8 mb-15">
                <a
                  href={`mailto:${siteConfig.social.email}`}
                  className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:border-orange-500 hover:text-orange-500 transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:border-orange-500 hover:text-orange-500 transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:border-orange-500 hover:text-orange-500 transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>

              <a
                href="#projects"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors group "
              >
                Scroll Down
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* 右侧：照片 */}
            <div className="relative">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <Image
                  src={siteConfig.portrait}
                  alt={siteConfig.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  priority
                />
                {/* 橙色装饰角 */}
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-orange-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-orange-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - 完全居中，不贴边 */}
      <section className="py-24 px-12 md:px-16 lg:px-20 xl:px-24 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-white">
            {[
              { name: 'Computational Interaction', slug: 'hci' },
              { name: 'Architecture', slug: 'architecture' },
              { name: 'Fabrication', slug: 'fabrication' },
              { name: 'Urban', slug: 'urban-interaction' }
            ].map((category, index) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative aspect-square bg-gray-50 hover:bg-orange-500 transition-all duration-300 flex items-center justify-center"
              >
                <h3 className="text-sm font-medium uppercase tracking-widest group-hover:text-white transition-colors text-center px-4">
                  {category.name}
                </h3>
                <span className="absolute top-4 left-4 text-xs text-gray-400 group-hover:text-white/60">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Projects - 横向滚动，增加上方间距 */}
      <section id="projects" className="pt-32 pb-24">
        {/* 标题区域 - 添加左右边距 */}
        <div className="px-12 md:px-16 lg:px-20 xl:px-24 mb-16">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-gray-500 mb-2">Where strategy meets design</p>
            <h2 className="text-5xl md:text-6xl font-bold">
              SELECTED
              <br />
              <span className="text-orange-500">WORKS</span>
            </h2>
          </div>
        </div>
        
        {/* 横向滚动容器 - 左边距对齐标题 */}
        <div className="relative">
          <div className="horizontal-scroll pl-12 md:pl-16 lg:pl-20 xl:pl-24 pr-12 md:pr-16 lg:pr-20 xl:pr-24">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.slug}
                href={project.url}
                className="group flex-shrink-0 w-[400px] opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                {/* 图片 */}
                <div className="relative aspect-[4/3] bg-gray-100 mb-6 overflow-hidden">
                  {project.heroUrl ? (
                    <Image
                      src={project.heroUrl}
                      alt={project.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  )}
                  
                  {/* 序号水印 */}
                  <div className="absolute top-6 left-6 text-6xl font-bold text-white/10 group-hover:text-orange-500/20 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* 信息 */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-gray-400">
                      {categoryDisplayNames[project.category] || project.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {project.year}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold group-hover:text-orange-500 transition-colors">
                    {project.title}
                  </h3>
                  
                  {project.subtitle && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            ))}
            
            {/* 查看全部按钮 */}
            <div className="flex-shrink-0 w-[400px] flex items-center justify-center">
              <Link
                href="/projects"
                className="flex flex-col items-center gap-4 px-8 py-12 border-2 border-gray-200 border-dashed hover:border-orange-500 transition-all rounded-lg group"
              >
                <span className="text-4xl group-hover:text-orange-500 transition-colors">+</span>
                <span className="text-sm uppercase tracking-wider group-hover:text-orange-500 transition-colors">
                  View All Projects
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="text-center mt-12 text-sm text-gray-400">
          ← Scroll to explore →
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-12 md:px-16 lg:px-20 xl:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 Dingran Dai. All rights reserved.
          </p>
          <div className="flex gap-6">
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
      </footer>
    </div>
  );
}