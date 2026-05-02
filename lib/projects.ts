// lib/projects.ts
import projectsRaw from "@/content/projects_index.json";

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

/**
 * Pick up to `count` related projects.
 * Same-category siblings come first (excluding the current project),
 * then we backfill with projects from other categories so the user
 * always gets the full count if the site has enough projects.
 *
 * Within each pool we sort by:
 *   1. featured first (so the strongest work surfaces)
 *   2. order ascending
 *   3. year descending
 */
export function getRelatedProjects(
  category: string,
  slug: string,
  count: number = 3,
): Project[] {
  const all = getAllProjects();

  const sorter = (a: Project, b: Project) => {
    const featuredDiff = Number(b.featured ?? false) - Number(a.featured ?? false);
    if (featuredDiff !== 0) return featuredDiff;
    const orderDiff = (a.order ?? 9999) - (b.order ?? 9999);
    if (orderDiff !== 0) return orderDiff;
    return (b.year ?? 0) - (a.year ?? 0);
  };

  const sameCategory = all
    .filter((p) => p.category === category && p.slug !== slug)
    .sort(sorter);

  const otherCategories = all
    .filter((p) => p.category !== category)
    .sort(sorter);

  const combined = [...sameCategory, ...otherCategories];

  // De-dup just in case (slugs are unique within category but not globally —
  // be paranoid in case a future schema change breaks that assumption).
  const seen = new Set<string>();
  const out: Project[] = [];
  for (const p of combined) {
    const key = `${p.category}/${p.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
    if (out.length >= count) break;
  }
  return out;
}