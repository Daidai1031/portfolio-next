"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useLayoutEffect, useRef } from "react";
import {
  categoryNames,
  isProjectCategory,
  projectCategories,
  projectSectionOrder,
  type ProjectCategory,
} from "@/lib/project-categories";
import type { Project } from "@/lib/projects";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import SiteHeader from "@/components/SiteHeader";

type SelectedCategory = "all" | ProjectCategory;

const filterLabels: Record<SelectedCategory, string> = {
  all: "All projects",
  "ai-digital-products": "AI & Digital",
  "physical-computing": "Physical Computing",
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

function sortProjects(projects: Project[]) {
  return [...projects].sort(
    (a, b) =>
      (a.order ?? 9999) - (b.order ?? 9999) ||
      (b.year ?? 0) - (a.year ?? 0),
  );
}

function animationDelay(index: number) {
  // 260ms animation + at most 120ms delay keeps the sequence below 400ms.
  return `${Math.min(index * 30, 120)}ms`;
}

function ProjectsView({
  projects,
  selectedCategory,
  onSelectCategory,
}: {
  projects: Project[];
  selectedCategory: SelectedCategory;
  onSelectCategory: (category: SelectedCategory) => void;
}) {
  const filterBarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const filterBar = filterBarRef.current;
    const page = filterBar?.parentElement;
    if (!filterBar || !page) return;

    // Wrapped filters change height with viewport width and text size.
    const updateHeight = () => {
      page.style.setProperty("--project-filter-height", `${filterBar.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(filterBar);
    return () => observer.disconnect();
  }, []);

  const projectsByCategory = projectSectionOrder.reduce(
    (groups, category) => {
      groups[category] = sortProjects(
        projects.filter((project) => project.category === category),
      );
      return groups;
    },
    {} as Record<ProjectCategory, Project[]>,
  );

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projectsByCategory[selectedCategory] ?? [];

  return (
    <div className="min-h-screen bg-white text-black">
      <ReadingProgressBar minimal />
      <SiteHeader />

      <div className="h-7 lg:h-12" />

      <section
        className="site-page-gutters pt-16 pb-5 lg:pt-24 lg:pb-6"
      >
        <div className="flex items-end justify-between">
          <h1 className="text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-orange-500">
            INDEX
          </h1>
          <span aria-live="polite" aria-atomic="true" className="text-[11px] tracking-[0.25em] text-gray-400 tabular-nums uppercase">
            {String(filteredProjects.length).padStart(2, "0")} Works
          </span>
        </div>
      </section>

      <div
        ref={filterBarRef}
        className="sticky z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-md"
        style={{ top: "var(--site-header-height)" }}
      >
        <div
          role="group"
          aria-label="Filter projects by category"
          className="site-page-gutters py-3 lg:py-4"
        >
          <div
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5"
          >
            {(["all", ...projectCategories] as const).map((category) => {
              const isSelected = selectedCategory === category;
              const label = filterLabels[category];

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  aria-controls="projects-list"
                  aria-label={label}
                  onClick={() => onSelectCategory(category)}
                  className={`flex min-h-9 min-w-0 items-center justify-center border px-3 py-1.5 text-center text-sm font-medium leading-5 transition-colors duration-200 last:col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-[#7a7a7a] bg-[#7a7a7a] text-white hover:border-orange-500 hover:bg-orange-500"
                  }`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div id="projects-list" key={selectedCategory}>
        {selectedCategory === "all" ? (
          <div className="pt-8 pb-16 lg:pt-10 lg:pb-32 space-y-24 lg:space-y-40">
            {projectSectionOrder.map((category, categoryIndex) => {
              const categoryProjects = projectsByCategory[category];
              if (categoryProjects.length === 0) return null;

              const sectionNum = String(categoryIndex + 1).padStart(2, "0");
              const totalInSection = String(categoryProjects.length).padStart(
                2,
                "0",
              );
              const previousProjectCount = projectSectionOrder
                .slice(0, categoryIndex)
                .reduce(
                  (total, previousCategory) =>
                    total + projectsByCategory[previousCategory].length,
                  0,
                );

              return (
                <section
                  key={category}
                  id={category}
                  style={{
                    scrollMarginTop: "calc(var(--site-header-height) + var(--project-filter-height, 80px) + 16px)",
                  }}
                >
                  <div
                    className="site-page-gutters mb-10 lg:mb-16"
                  >
                    <div className="flex items-center gap-3 mb-3 lg:mb-4">
                      <span className="text-[11px] tracking-[0.25em] text-orange-500 font-medium tabular-nums">
                        {sectionNum}
                      </span>
                      <span className="w-6 h-px bg-gray-300" />
                      <span className="text-[11px] tracking-[0.25em] text-gray-400 uppercase tabular-nums">
                        {totalInSection}{" "}
                        {categoryProjects.length === 1 ? "project" : "projects"}
                      </span>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                      {categoryNames[category]}
                    </h2>
                  </div>

                  <div className="site-page-gutters">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-12 lg:gap-y-16">
                      {categoryProjects.map((project, index) => (
                        <div
                          key={`${project.category}-${project.slug}`}
                          className="project-filter-card min-w-0"
                          style={{
                            animationDelay: animationDelay(
                              previousProjectCount + index,
                            ),
                          }}
                        >
                          <ProjectCard project={project} index={index} />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div
            className="site-page-gutters pt-8 pb-16 lg:pt-10 lg:pb-32"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-12 lg:gap-y-16">
              {filteredProjects.map((project, index) => (
                <div
                  key={`${project.category}-${project.slug}`}
                  className="project-filter-card min-w-0"
                  style={{ animationDelay: animationDelay(index) }}
                >
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer
        className="site-footer site-page-gutters py-14 lg:py-20"
      >
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row lg:gap-8">
          <p className="site-footer-signature">
            Dingran Dai &copy; {new Date().getFullYear()}
          </p>
          <Link
            href="/"
            className="site-footer-link"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

function SearchParamProjects({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const selectedCategory: SelectedCategory = isProjectCategory(
    requestedCategory,
  )
    ? requestedCategory
    : "all";

  function selectCategory(category: SelectedCategory) {
    if (category === selectedCategory) return;

    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    const query = params.toString();
    router.replace(query ? `/projects?${query}` : "/projects", {
      scroll: false,
    });
  }

  return (
    <ProjectsView
      projects={projects}
      selectedCategory={selectedCategory}
      onSelectCategory={selectCategory}
    />
  );
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  return (
    <Suspense
      fallback={
        <ProjectsView
          projects={projects}
          selectedCategory="all"
          onSelectCategory={() => undefined}
        />
      }
    >
      <SearchParamProjects projects={projects} />
    </Suspense>
  );
}
