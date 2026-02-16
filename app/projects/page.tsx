// app/projects/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

export default function AllProjectsPage() {
  const allProjects = getAllProjects();
  
  // 按分类分组
  const projectsByCategory = allProjects.reduce((acc, project) => {
    if (!acc[project.category]) {
      acc[project.category] = [];
    }
    acc[project.category].push(project);
    return acc;
  }, {} as Record<string, typeof allProjects>);

  // 排序
  Object.keys(projectsByCategory).forEach(category => {
    projectsByCategory[category].sort(
      (a, b) =>
        (a.order ?? 9999) - (b.order ?? 9999) ||
        (b.year ?? 0) - (a.year ?? 0)
    );
  });

  const categoryOrder = ['hci', 'architecture', 'fabrication', 'urban-interaction'];
  const categoryNames = {
    'hci': 'Computational Interaction',
    'architecture': 'Architecture',
    'fabrication': 'Fabrication',
    'urban-interaction': 'Urban'
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation - 与 Home 一致的 144px 边距 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div style={{ paddingLeft: '144px', paddingRight: '144px', paddingTop: '24px', paddingBottom: '24px' }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            
            <div className="flex items-center gap-16">
              <Link href="/projects" className="text-sm font-medium text-orange-500">
                Projects
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">
                About
              </Link>
              <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - 与 Home 一致的边距 */}
      <section className="pt-48 pb-32" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <div className="mb-16">
          <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">Complete Portfolio</p>
          <h1 className="text-6xl md:text-7xl font-bold mb-12">
            ALL <span className="text-orange-500">PROJECTS</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            A comprehensive collection of my work across spatial design,
            human-computer interaction, fabrication, and urban experiences.
          </p>
        </div>
      </section>

      {/* Projects by Category - 横向滚动 */}
      <div className="pb-32 space-y-64">
        {categoryOrder.map(category => {
          const projects = projectsByCategory[category];
          if (!projects || projects.length === 0) return null;

          return (
            <section key={category} id={category}>
              {/* Category Header - 与 Home 一致的边距 */}
              <div className="mb-28" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
                <div className="pb-8 border-b border-gray-200">
                  <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">
                    Category
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h2>
                </div>
              </div>

              {/* 横向滚动项目 - 与 Home 一致 */}
              <div className="relative">
                <div className="horizontal-scroll pb-4" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
                  {projects.map((project, index) => (
                    <Link
                      key={project.slug}
                      href={project.url}
                      className="group flex-shrink-0 w-[460px]"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-gray-100 mb-6 overflow-hidden rounded-lg">
                        {project.heroUrl ? (
                          <Image
                            src={project.heroUrl}
                            alt={project.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                        )}
                        
                        {/* Number */}
                        <div className="absolute top-6 left-6 text-7xl font-bold text-white/20 group-hover:text-orange-500/30 transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                            {categoryNames[category as keyof typeof categoryNames]}
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
                </div>
              </div>

              {/* Scroll hint */}
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
          );
        })}
      </div>

      {/* Footer - 与 Home 一致 */}
      <footer className="border-t border-gray-200 py-16 bg-gray-50 mt-48" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Dingran Dai. All rights reserved.
          </p>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}