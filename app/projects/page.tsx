// app/projects/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

const NAV_PADDING = "clamp(24px, 10vw, 144px)";

export default function AllProjectsPage() {
  const allProjects = getAllProjects();

  const projectsByCategory = allProjects.reduce((acc, project) => {
    if (!acc[project.category]) acc[project.category] = [];
    acc[project.category].push(project);
    return acc;
  }, {} as Record<string, typeof allProjects>);

  Object.keys(projectsByCategory).forEach(category => {
    projectsByCategory[category].sort(
      (a, b) => (a.order ?? 9999) - (b.order ?? 9999) || (b.year ?? 0) - (a.year ?? 0)
    );
  });

  const categoryOrder = ['hci', 'architecture', 'fabrication', 'urban-interaction'];
  const categoryNames: Record<string, string> = {
    'hci': 'Computational Interaction',
    'architecture': 'Architecture',
    'fabrication': 'Fabrication',
    'urban-interaction': 'Urban'
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="py-4 lg:py-6" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg lg:text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">DINGRAN DAI</Link>
            <div className="flex items-center gap-6 lg:gap-16">
              <Link href="/projects" className="text-xs lg:text-sm font-medium text-orange-500">Projects</Link>
              <Link href="/about" className="text-xs lg:text-sm font-medium hover:text-orange-500 transition-colors">About</Link>
              <Link href="/about#connect" className="text-xs lg:text-sm font-medium hover:text-orange-500 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-5 lg:h-10" />

      {/* Hero */}
      <section className="pt-24 pb-6 lg:pt-48 lg:pb-32" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
        <div className="mb-6 lg:mb-16">
          <p className="text-xs text-gray-500 mb-2 lg:mb-4 uppercase tracking-wider">Complete Portfolio</p>
          <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold mb-4 lg:mb-12">
            ALL <span className="text-orange-500">PROJECTS</span>
          </h1>
          <p className="text-sm lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
            A comprehensive collection of my work across spatial design,
            human-computer interaction, fabrication, and urban experiences.
          </p>
        </div>
      </section>

      {/* Projects by Category */}
      <div className="pb-10 lg:pb-32 space-y-16 lg:space-y-64">
        {categoryOrder.map(category => {
          const projects = projectsByCategory[category];
          if (!projects || projects.length === 0) return null;

          return (
            <section key={category} id={category} style={{ scrollMarginTop: '80px' }}>
              {/* Category Header */}
              <div className="mb-8 lg:mb-28" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
                <div className="pb-4 lg:pb-8 border-b border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 lg:mb-3 uppercase tracking-wider">Category</p>
                  <h2 className="text-xl sm:text-2xl lg:text-5xl font-bold">
                    {categoryNames[category]}
                  </h2>
                </div>
              </div>

              {/* ═══ Mobile: clean gallery — text below image ═══ */}
              <div className="md:hidden" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
                <div className="space-y-10">
                  {projects.map((project, index) => {
                    const isFullWidth = index % 3 === 0;

                    // Full-width card — text below
                    if (isFullWidth) {
                      return (
                        <Link key={project.slug} href={project.url} className="group block">
                          <div className="relative w-full overflow-hidden rounded-lg bg-gray-100" style={{ aspectRatio: '16 / 10' }}>
                            {project.heroUrl ? (
                              <Image
                                src={project.heroUrl}
                                alt={project.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                            )}
                          </div>
                          <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-orange-500 mb-1 font-medium">
                              {categoryNames[category]}
                            </p>
                            <h3 className="text-sm font-bold leading-tight group-hover:text-orange-500 transition-colors">
                              {project.title}
                            </h3>
                            {project.year && (
                              <p className="text-xs text-gray-400 mt-1">{project.year}</p>
                            )}
                          </div>
                        </Link>
                      );
                    }

                    // Side-by-side pair: only render from the first of the two
                    if (index % 3 === 2) return null;

                    const nextProject = projects[index + 1] ?? null;

                    return (
                      <div key={project.slug} className="grid grid-cols-2 gap-4">
                        {/* Left */}
                        <Link href={project.url} className="group block">
                          <div className="relative w-full overflow-hidden rounded-lg bg-gray-100" style={{ aspectRatio: '3 / 4' }}>
                            {project.heroUrl ? (
                              <Image
                                src={project.heroUrl}
                                alt={project.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                            )}
                          </div>
                          <div className="mt-2.5">
                            <h3 className="text-xs font-bold leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">
                              {project.title}
                            </h3>
                            {project.year && (
                              <p className="text-[10px] text-gray-400 mt-0.5">{project.year}</p>
                            )}
                          </div>
                        </Link>

                        {/* Right */}
                        {nextProject ? (
                          <Link href={nextProject.url} className="group block">
                            <div className="relative w-full overflow-hidden rounded-lg bg-gray-100" style={{ aspectRatio: '3 / 4' }}>
                              {nextProject.heroUrl ? (
                                <Image
                                  src={nextProject.heroUrl}
                                  alt={nextProject.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                              )}
                            </div>
                            <div className="mt-2.5">
                              <h3 className="text-xs font-bold leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">
                                {nextProject.title}
                              </h3>
                              {nextProject.year && (
                                <p className="text-[10px] text-gray-400 mt-0.5">{nextProject.year}</p>
                              )}
                            </div>
                          </Link>
                        ) : <div />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ═══ Desktop: horizontal scroll ═══ */}
              <div className="relative hidden md:block">
                <div className="horizontal-scroll pb-4" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
                  {projects.map((project, index) => (
                    <Link key={project.slug} href={project.url} className="group flex-shrink-0 w-[460px]">
                      <div className="relative aspect-[4/3] bg-gray-100 mb-6 overflow-hidden rounded-lg">
                        {project.heroUrl ? (
                          <Image
                            src={project.heroUrl}
                            alt={project.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                        <div className="absolute top-6 left-6 text-7xl font-bold text-white/20 group-hover:text-orange-500/30 transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">{categoryNames[category]}</span>
                          <span className="text-xs text-gray-400">{project.year}</span>
                        </div>
                        <h3 className="text-2xl font-bold group-hover:text-orange-500 transition-colors leading-tight">{project.title}</h3>
                        {project.subtitle && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{project.subtitle}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="text-center mt-8 lg:mt-20 text-sm text-gray-400 hidden md:flex items-center justify-center gap-3">
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

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50 mt-8 lg:mt-48"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">Back to Home</Link>
        </div>
      </footer>
    </div>
  );
}