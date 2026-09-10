"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  isProjectCategory,
  projectCategories,
  type ProjectCategory,
} from "@/lib/project-categories";
import type { Project } from "@/lib/projects";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type SelectedCategory = "all" | ProjectCategory;

const filterLabels: Record<SelectedCategory, string> = {
  all: "All projects",
  "ai-digital-products": "AI & Digital",
  "physical-computing": "Physical Computing",
  "creative-media": "Creative Media",
  "architecture-fabrication": "Architecture",
};

const allProjectOrder = [
  "physical-computing/socratidesk",
  "physical-computing/subway-telltale",
  "creative-media/encoded-elevation",
  "creative-media/camino-quest-board-game",
  "physical-computing/geomelody",
  "ai-digital-products/teaguard",
  "ai-digital-products/into-place",
  "physical-computing/prompt",
  "ai-digital-products/ceta-prototype",
  "architecture-fabrication/passive-self-leveling-cup-holder",
  "creative-media/ironic-shaxi",
  "architecture-fabrication/3d-printed-bamboo-structure",
  "architecture-fabrication/dupont-paper-plywood-installation",
  "physical-computing/adaptive-tension-structure",
  "creative-media/interactive-pocket-parks",
  "creative-media/urban-systems-storymap",
  "architecture-fabrication/river-life-museum-xiguan",
  "architecture-fabrication/kindergarten-spatial-design",
  "architecture-fabrication/huanshi-east-city-renewal",
] as const;

const allProjectRanks = new Map<string, number>(
  allProjectOrder.map((projectKey, index) => [projectKey, index]),
);

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const idx = String(index + 1).padStart(2, "0");

  return (
    <Link key={project.slug} href={project.url} className="group block min-w-0">
      <div className="relative aspect-[4/3] rounded-lg bg-gray-100 overflow-hidden">
        {project.heroUrl ? (
          <Image
            src={project.heroUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 40vw, 85vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-orange-500 opacity-0 -translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-orange-500 opacity-0 translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-500" />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] tracking-[0.2em] tabular-nums">
          <span className="text-orange-500">{idx}</span>
          {project.year && <span className="text-gray-500">{project.year}</span>}
        </div>
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

function sortAllProjects(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const aRank = allProjectRanks.get(`${a.category}/${a.slug}`) ?? Number.MAX_SAFE_INTEGER;
    const bRank = allProjectRanks.get(`${b.category}/${b.slug}`) ?? Number.MAX_SAFE_INTEGER;

    return aRank - bRank || (a.order ?? 9999) - (b.order ?? 9999);
  });
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
  const filteredProjects = selectedCategory === "all"
    ? sortAllProjects(projects)
    : sortProjects(projects.filter((project) => project.category === selectedCategory));

  return (
    <div className="min-h-screen bg-white text-black">
      <ReadingProgressBar minimal />
      <SiteHeader />

      <main className="projects-index site-page-gutters">
        <aside className="projects-index-sidebar" aria-label="Project index">
          <h1 className="projects-index-title">INDEX</h1>
          <div role="group" aria-label="Filter projects by category" className="projects-index-filters">
            {(["all", ...projectCategories] as const).map((category) => {
              const isSelected = selectedCategory === category;
              const label = filterLabels[category];
              const count = category === "all"
                ? projects.length
                : projects.filter((project) => project.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  aria-controls="projects-list"
                  aria-label={label}
                  onClick={() => onSelectCategory(category)}
                  className="projects-index-filter"
                >
                  <span>{label}</span>
                  <span className="projects-index-leader" aria-hidden="true" />
                  <span className="projects-index-count" aria-hidden="true">{String(count).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>
          <p className="sr-only" role="status" aria-atomic="true">{filteredProjects.length} projects shown</p>
        </aside>

        <div id="projects-list" key={selectedCategory} className="min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 lg:gap-y-12">
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
      </main>

      <SiteFooter />
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
