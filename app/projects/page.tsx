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

  const totalProjects = allProjects.length;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="py-5 lg:py-7" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-base lg:text-lg font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            <div className="flex items-center gap-8 lg:gap-12">
              <Link href="/projects" className="text-xs lg:text-sm font-medium text-orange-500">Projects</Link>
              <Link href="/about" className="text-xs lg:text-sm font-medium hover:text-orange-500 transition-colors">About</Link>
              <Link href="/about#connect" className="text-xs lg:text-sm font-medium hover:text-orange-500 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="h-7 lg:h-12" />
{/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section
        className="pt-16 pb-24 lg:pt-24 lg:pb-40"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-4 mb-12 lg:mb-16">
          <span className="w-10 h-px bg-orange-500" />
          <span className="text-[11px] tracking-[0.3em] text-orange-500 uppercase font-medium">
            Index
          </span>
          <span className="ml-auto text-[11px] tracking-[0.25em] text-gray-400 tabular-nums uppercase">
            {String(totalProjects).padStart(2, '0')} Works
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight">
          All <span className="text-orange-500">Projects</span>
        </h1>

        {/* Spacer — replaces the description paragraph */}
        <div className="h-3 lg:h-6" />
      </section>

      {/* Divider between hero and content */}
      <div style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
        <div className="h-px bg-gray-200" />
      </div>

      {/* ═══════════════════════════════════════════
          PROJECTS BY CATEGORY
          ═══════════════════════════════════════════ */}
      <div className="py-16 lg:py-32 space-y-24 lg:space-y-40">
        {categoryOrder.map((category, categoryIndex) => {
          const projects = projectsByCategory[category];
          if (!projects || projects.length === 0) return null;

          const sectionNum = String(categoryIndex + 1).padStart(2, '0');
          const totalInSection = String(projects.length).padStart(2, '0');

          return (
            <section key={category} id={category} style={{ scrollMarginTop: '80px' }}>
              {/* ─── Category header ─── */}
              <div
                className="mb-10 lg:mb-16"
                style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
              >
                {/* Eyebrow row */}
                <div className="flex items-center gap-3 mb-3 lg:mb-4">
                  <span className="text-[11px] tracking-[0.25em] text-orange-500 font-medium tabular-nums">
                    {sectionNum}
                  </span>
                  <span className="w-6 h-px bg-gray-300" />
                  <span className="text-[11px] tracking-[0.25em] text-gray-400 uppercase tabular-nums">
                    {totalInSection} {projects.length === 1 ? 'project' : 'projects'}
                  </span>
                </div>

                {/* Category title — clearly smaller than hero */}
                <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                  {categoryNames[category]}
                </h2>
              </div>

              {/* ═══ Mobile ═══ */}
              <div className="md:hidden" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
                <div className="space-y-10">
                  {projects.map((project, index) => {
                    const isFullWidth = index % 3 === 0;
                    const idx = String(index + 1).padStart(2, '0');

                    if (isFullWidth) {
                      return (
                        <Link key={project.slug} href={project.url} className="group block">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] tracking-[0.25em] text-gray-400 tabular-nums">{idx}</span>
                            {project.year && (
                              <span className="text-[10px] tracking-[0.2em] text-gray-400 tabular-nums">{project.year}</span>
                            )}
                          </div>
                          <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '16 / 10' }}>
                            {project.heroUrl ? (
                              <Image src={project.heroUrl} alt={project.title} fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                            )}
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-500" />
                          </div>
                          <h3 className="mt-3 text-base font-semibold leading-snug group-hover:text-orange-500 transition-colors">
                            {project.title}
                          </h3>
                        </Link>
                      );
                    }

                    if (index % 3 === 2) return null;
                    const next = projects[index + 1] ?? null;
                    const nextIdx = String(index + 2).padStart(2, '0');

                    return (
                      <div key={project.slug} className="grid grid-cols-2 gap-4">
                        <Link href={project.url} className="group block">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] tracking-[0.2em] text-gray-400 tabular-nums">{idx}</span>
                            {project.year && <span className="text-[9px] tracking-[0.15em] text-gray-400 tabular-nums">{project.year}</span>}
                          </div>
                          <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '3 / 4' }}>
                            {project.heroUrl ? (
                              <Image src={project.heroUrl} alt={project.title} fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                            )}
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-500" />
                          </div>
                          <h3 className="mt-2 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                            {project.title}
                          </h3>
                        </Link>

                        {next ? (
                          <Link href={next.url} className="group block">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9px] tracking-[0.2em] text-gray-400 tabular-nums">{nextIdx}</span>
                              {next.year && <span className="text-[9px] tracking-[0.15em] text-gray-400 tabular-nums">{next.year}</span>}
                            </div>
                            <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '3 / 4' }}>
                              {next.heroUrl ? (
                                <Image src={next.heroUrl} alt={next.title} fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                              )}
                              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-500" />
                            </div>
                            <h3 className="mt-2 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                              {next.title}
                            </h3>
                          </Link>
                        ) : <div />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ═══ Desktop horizontal scroll ═══ */}
              <div className="relative hidden md:block">
                <div
                  className="horizontal-scroll pb-4"
                  style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
                >
                  {projects.map((project, index) => {
                    const idx = String(index + 1).padStart(2, '0');

                    return (
                      <Link
                        key={project.slug}
                        href={project.url}
                        className="group flex-shrink-0 w-[420px] lg:w-[440px]"
                      >
                        {/* Spec strip — quiet, single line */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 group-hover:border-orange-500 transition-colors duration-300">
                          <span className="text-[11px] tracking-[0.25em] text-orange-500 font-medium tabular-nums">
                            {idx}
                          </span>
                          {project.year && (
                            <span className="text-[11px] tracking-[0.2em] text-gray-400 tabular-nums">
                              {project.year}
                            </span>
                          )}
                        </div>

                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                          {project.heroUrl ? (
                            <Image
                              src={project.heroUrl}
                              alt={project.title}
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                          )}
                          {/* Corner marks — fade in on hover */}
                          <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-orange-500 opacity-0 -translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                          <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-orange-500 opacity-0 translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                          {/* Sliding bar */}
                          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-500" />
                        </div>

                        {/* Title + subtitle — clean two-line block */}
                        <div className="mt-4">
                          <h3 className="text-xl font-semibold leading-snug tracking-tight group-hover:text-orange-500 transition-colors">
                            {project.title}
                          </h3>
                          {project.subtitle && (
                            <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-[1.55]">
                              {project.subtitle}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Scroll hint — desktop only, quieter */}
              <div className="hidden md:flex items-center justify-center gap-3 mt-12 text-[10px] tracking-[0.3em] text-gray-300 uppercase">
                <span className="w-6 h-px bg-gray-200" />
                Scroll
                <span className="w-6 h-px bg-gray-200" />
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <footer
        className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
          <p className="text-xs lg:text-sm text-gray-500">
            © {new Date().getFullYear()} Dingran Dai. All rights reserved.
          </p>
          <Link href="/" className="text-xs lg:text-sm text-gray-500 hover:text-orange-500 transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}