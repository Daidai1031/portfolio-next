'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/projects';

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'ai-software': 'AI & Software',
  'hardware-product': 'Hardware & Product',
  'creative-media': 'Creative Media',
  'architecture-fabrication': 'Architecture & Fabrication',
};

interface Props {
  projects: Project[];
  currentCategory: string;
  currentSkills?: string[];
}

function matchingSkills(currentSkills: string[], target?: string[], max = 3): string[] {
  if (!target?.length || !currentSkills?.length) return [];
  const set = new Set(currentSkills.map((s) => s.toLowerCase()));
  return target.filter((s) => set.has(s.toLowerCase())).slice(0, max);
}

export default function RelatedProjects({
  projects,
  currentCategory,
  currentSkills = [],
}: Props) {
  if (projects.length === 0) return null;

  return (
    <section
      className="mt-8 lg:mt-12 py-14 lg:py-24 bg-gray-50/60 border-t border-gray-200"
      style={{
        paddingLeft: 'clamp(48px, 12vw, 176px)',
        paddingRight: 'clamp(48px, 12vw, 176px)',
      }}
    >
      <div className="flex items-center gap-4 mb-8 lg:mb-12">
        <span className="w-8 h-px bg-orange-500" />
        <span className="text-[11px] tracking-[0.3em] text-orange-500 uppercase font-medium">
          Keep exploring
        </span>
      </div>

      <div className="flex items-end justify-between mb-8 lg:mb-14 flex-wrap gap-4">
        <h2 className="text-2xl lg:text-4xl font-bold tracking-tight">
          Related <span className="text-orange-500">Projects</span>
        </h2>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600 lg:text-sm"
        >
          View all projects
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((project, index) => {
          const isSameCategory = project.category === currentCategory;
          const idx = String(index + 1).padStart(2, '0');
          const categoryLabel =
            CATEGORY_DISPLAY_NAMES[project.category] ?? project.category;
          const matches = matchingSkills(currentSkills, project.skills, 3);

          return (
            <Link
              key={`${project.category}-${project.slug}`}
              href={project.url}
              className="group block"
            >
              {/* Spec strip */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 group-hover:border-orange-500 transition-colors duration-300">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] tracking-[0.25em] text-orange-500 font-medium tabular-nums">
                    {idx}
                  </span>
                  <span className="text-[11px] tracking-[0.2em] text-gray-400 uppercase">
                    {isSameCategory ? 'Same area' : 'Other work'}
                  </span>
                </div>
                {project.year && (
                  <span className="text-[11px] tracking-[0.2em] text-gray-400 tabular-nums">
                    {project.year}
                  </span>
                )}
              </div>

              {/* Image */}
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                {project.heroUrl ? (
                  <Image
                    src={project.heroUrl}
                    alt={project.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    sizes="(min-width: 1024px) 28vw, (min-width: 768px) 30vw, 100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-orange-500 opacity-0 -translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-orange-500 opacity-0 translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-500" />
              </div>

              {/* Category eyebrow + title + subtitle */}
              <div className="mt-4 lg:mt-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-500 mb-1.5 lg:mb-2 font-medium">
                  {categoryLabel}
                </p>
                <h3 className="text-base lg:text-lg font-semibold leading-snug group-hover:text-orange-500 transition-colors line-clamp-2">
                  {project.title}
                </h3>
                {project.subtitle && (
                  <p className="mt-1.5 text-xs lg:text-sm text-gray-500 line-clamp-2 leading-[1.55]">
                    {project.subtitle}
                  </p>
                )}

                {/* Matching skill pills */}
                {matches.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {matches.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-medium tracking-wide px-2 py-1 bg-gray-100 text-gray-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}