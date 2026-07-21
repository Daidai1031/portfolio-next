// lib/projects.ts
import projectsRaw from "@/content/projects_index.json";

export interface ProjectDecisionOption {
  option: string;
  why: string;
}

export interface ProjectDecision {
  question: string;
  rejected: ProjectDecisionOption;
  chosen: ProjectDecisionOption;
  quote?: string;
}

export type Project = {
  category: string;
  slug: string;
  url: string;
  title: string;

  // optional meta
  subtitle?: string;
  year?: number;
  date?: string;
  location?: string;
  order?: number;
  role?: string[];
  featured?: boolean;
  skills?: string[];  
  decision?: ProjectDecision;

  // computed by build_projects_index.py
  mdxPath: string;          // e.g. "content/projects/hci/encoded-elevation/index.mdx"
  heroUrl?: string | null;  // e.g. "/projects/hci/encoded-elevation/hero.jpg"
  galleryUrls?: string[];   // e.g. ["/projects/.../gallery-1.jpg", ...]
};

const projects = projectsRaw as Project[];

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectsByCategory(category: string): Project[] {
  return getAllProjects()
    .filter((p) => p.category === category)
    .sort(
      (a, b) =>
        (a.order ?? 9999) - (b.order ?? 9999) ||
        (b.year ?? 0) - (a.year ?? 0),
    );
}

export function getProjectByCategorySlug(category: string, slug: string) {
  return getAllProjects().find((p) => p.category === category && p.slug === slug);
}

export function getPrevNext(category: string, slug: string) {
  const list = getProjectsByCategory(category);
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? list[i - 1] : null,
    next: i < list.length - 1 ? list[i + 1] : null,
  };
}

// ── Skill helpers ───────────────────────────────────────
function normSkill(s: string): string {
  return s.trim().toLowerCase();
}

function skillSet(p: Project | undefined | null): Set<string> {
  return new Set((p?.skills ?? []).map(normSkill));
}

/**
 * Return the skills that appear in BOTH projects, preserving the
 * casing/order from `b.skills` (so the displayed pills match what
 * shows on b's own detail page).
 */
export function getMatchingSkills(a: Project, b: Project, max = 3): string[] {
  const aSet = skillSet(a);
  return (b.skills ?? [])
    .filter((s) => aSet.has(normSkill(s)))
    .slice(0, max);
}

/**
 * Rank candidates by skill overlap with the current project.
 * Tiebreakers: same-category, then featured, then order asc, then year desc.
 */
export function getRelatedProjects(
  category: string,
  slug: string,
  count: number = 3,
): Project[] {
  const all = getAllProjects();
  const current = all.find((p) => p.category === category && p.slug === slug);
  const currentSkills = skillSet(current);

  const candidates = all.filter(
    (p) => !(p.category === category && p.slug === slug),
  );

  const scored = candidates.map((p) => {
    const overlap = (p.skills ?? []).filter((s) =>
      currentSkills.has(normSkill(s)),
    ).length;
    return {
      project: p,
      overlap,
      sameCategory: p.category === category ? 1 : 0,
      featured: p.featured ? 1 : 0,
      order: p.order ?? 9999,
      year: p.year ?? 0,
    };
  });

  scored.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    if (b.sameCategory !== a.sameCategory) return b.sameCategory - a.sameCategory;
    if (b.featured !== a.featured) return b.featured - a.featured;
    if (a.order !== b.order) return a.order - b.order;
    return b.year - a.year;
  });

  return scored.slice(0, count).map((s) => s.project);
}
