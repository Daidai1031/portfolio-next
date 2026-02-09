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
