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
    'hci': 'HCI',
    'architecture': 'Architecture',
    'fabrication': 'Fabrication',
    'urban-interaction': 'Urban Interaction'
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            DINGRAN DAI
          </Link>
          
          <div className="flex items-center gap-8">
            <Link href="/projects" className="text-sm text-orange-500">
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

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">Complete Portfolio</p>
            <h1 className="text-6xl md:text-7xl font-bold">
              ALL
              <br />
              <span className="text-orange-500">PROJECTS</span>
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-2xl">
            A comprehensive collection of my work across spatial design,
            human-computer interaction, fabrication, and urban experiences.
          </p>
        </div>
      </section>

      {/* Projects by Category - 横向滚动 */}
      <div className="py-20 space-y-32">
        {categoryOrder.map(category => {
          const projects = projectsByCategory[category];
          if (!projects || projects.length === 0) return null;

          return (
            <section key={category} id={category}>
              {/* Category Header */}
              <div className="px-6 mb-12">
                <div className="max-w-7xl mx-auto flex items-end justify-between pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">
                      Category
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </h2>
                  </div>
                  <Link
                    href={`/categories/${category}`}
                    className="text-sm text-orange-500 hover:underline flex items-center gap-1"
                  >
                    View Category
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* 横向滚动项目 */}
              <div className="horizontal-scroll px-6">
                {projects.map((project, index) => (
                  <Link
                    key={project.slug}
                    href={project.url}
                    className="group flex-shrink-0 w-[400px]"
                  >
                    {/* Image */}
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
                      
                      {/* Number */}
                      <div className="absolute top-6 left-6 text-6xl font-bold text-white/10 group-hover:text-orange-500/20 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-gray-400">
                          {project.category}
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
              </div>

              {/* Scroll hint */}
              <div className="text-center mt-8 text-sm text-gray-400">
                ← Scroll to explore →
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 Dingran Dai. All rights reserved.
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