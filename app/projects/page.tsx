// app/projects/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getAllProjects, type Project } from "@/lib/projects";

const NAV_PADDING = "clamp(24px, 10vw, 144px)";

const categoryOrder = ["ai-software", "hardware-product", "creative-media", "architecture-fabrication"];

const categoryNames: Record<string, string> = {
  "ai-software": "AI & Software",
  "hardware-product": "Hardware & Product",
  "creative-media": "Creative Media",
  "architecture-fabrication": "Architecture & Fabrication",
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const idx = String(index + 1).padStart(2, "0");

  return (
    <Link key={project.slug} href={project.url} className="group block min-w-0">
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

      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {project.heroUrl ? (
          <Image
            src={project.heroUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-orange-500 opacity-0 -translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-orange-500 opacity-0 translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-500" />
      </div>

      <div className="mt-4">
        <h3 className="text-base lg:text-xl font-semibold leading-snug tracking-tight group-hover:text-orange-500 transition-colors">
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
}

export default function AllProjectsPage() {
  const allProjects = getAllProjects();

  const projectsByCategory = allProjects.reduce(
    (acc, project) => {
      if (!acc[project.category]) acc[project.category] = [];
      acc[project.category].push(project);
      return acc;
    },
    {} as Record<string, Project[]>,
  );

  Object.keys(projectsByCategory).forEach((category) => {
    projectsByCategory[category].sort(
      (a, b) =>
        (a.order ?? 9999) - (b.order ?? 9999) ||
        (b.year ?? 0) - (a.year ?? 0),
    );
  });

  const totalProjects = allProjects.length;

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div
          className="py-5 lg:py-7"
          style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-base lg:text-lg font-bold tracking-tight hover:text-orange-500 transition-colors"
            >
              DINGRAN DAI
            </Link>
            <div className="flex items-center gap-8 lg:gap-12">
              <Link
                href="/projects"
                className="text-xs lg:text-sm font-medium text-orange-500"
              >
                Projects
              </Link>
              <Link
                href="/about"
                className="text-xs lg:text-sm font-medium hover:text-orange-500 transition-colors"
              >
                About
              </Link>
              <Link
                href="/about#connect"
                className="text-xs lg:text-sm font-medium hover:text-orange-500 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-7 lg:h-12" />

      <section
        className="pt-16 pb-8 lg:pt-24 lg:pb-12"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="flex items-center gap-4 mb-8 lg:mb-10">
          <span className="w-10 h-px bg-orange-500" />
          <span className="text-[11px] tracking-[0.3em] text-orange-500 uppercase font-medium">
            Index
          </span>
          <span className="ml-auto text-[11px] tracking-[0.25em] text-gray-400 tabular-nums uppercase">
            {String(totalProjects).padStart(2, "0")} Works
          </span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight">
          All <span className="text-orange-500">Projects</span>
        </h1>
      </section>

      <div style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
        <div className="h-px bg-gray-200" />
      </div>

      <div className="pt-10 pb-16 lg:pt-14 lg:pb-32 space-y-24 lg:space-y-40">
        {categoryOrder.map((category, categoryIndex) => {
          const projects = projectsByCategory[category];
          if (!projects || projects.length === 0) return null;

          const sectionNum = String(categoryIndex + 1).padStart(2, "0");
          const totalInSection = String(projects.length).padStart(2, "0");

          return (
            <section key={category} id={category} style={{ scrollMarginTop: "80px" }}>
              <div
                className="mb-10 lg:mb-16"
                style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
              >
                <div className="flex items-center gap-3 mb-3 lg:mb-4">
                  <span className="text-[11px] tracking-[0.25em] text-orange-500 font-medium tabular-nums">
                    {sectionNum}
                  </span>
                  <span className="w-6 h-px bg-gray-300" />
                  <span className="text-[11px] tracking-[0.25em] text-gray-400 uppercase tabular-nums">
                    {totalInSection} {projects.length === 1 ? "project" : "projects"}
                  </span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                  {categoryNames[category]}
                </h2>
              </div>

              <div style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-12 lg:gap-y-16">
                  {projects.map((project, index) => (
                    <ProjectCard
                      key={`${project.category}-${project.slug}`}
                      project={project}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <footer
        className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
          <p className="text-xs lg:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Dingran Dai. All rights reserved.
          </p>
          <Link
            href="/"
            className="text-xs lg:text-sm text-gray-500 hover:text-orange-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
