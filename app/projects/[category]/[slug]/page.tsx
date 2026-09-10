// app/projects/[category]/[slug]/page.tsx
import {
  getProjectByCategorySlug,
  getRelatedProjects,
  getAllProjects,
} from "@/lib/projects";
import { readMdxRaw } from "@/lib/mdx";
import {
  splitMdxIntoSections,
  sectionsToNavDefs,
} from "@/lib/mdx-sections";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import ProjectDetailClient from "./ProjectDetailClient";
import { categoryNames } from "@/lib/project-categories";

const categoryDisplayNames: Record<string, string> = categoryNames;

interface ProjectWithVideo {
  video?: string;
  [key: string]: any;
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    category: project.category,
    slug: project.slug,
  }));
}

function getProjectImages(category: string, slug: string) {
  const projectDir = path.join(
    process.cwd(),
    "public",
    "projects",
    category,
    slug,
  );

  const images = {
    portfolio: [] as string[],
    gallery: [] as string[],
  };

  try {
    const files = fs.readdirSync(projectDir);
    files.forEach((file) => {
      const ext = path.extname(file).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) return;
      const fileName = path.basename(file, ext);
      const imageUrl = `/projects/${category}/${slug}/${file}`;
      if (fileName.startsWith("portfolio-")) images.portfolio.push(imageUrl);
      else if (fileName.startsWith("gallery-")) images.gallery.push(imageUrl);
    });
    images.portfolio.sort();
    images.gallery.sort();
  } catch (error) {
    console.error(`Error reading images for ${category}/${slug}:`, error);
  }

  return images;
}

function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const project = getProjectByCategorySlug(category, slug);
  if (!project) notFound();

  const projectWithVideo = project as ProjectWithVideo;
  const projectImages = getProjectImages(category, slug);
  const hasPortfolio = projectImages.portfolio.length > 0;
  const videoId = projectWithVideo.video
    ? getYouTubeId(projectWithVideo.video)
    : null;
  const embedUrl = (project as any).embed || null;

  // ── Read & slice MDX into pure-string sections ──────────────────────
  // Everything below the boundary is plain serializable data — no React
  // nodes, no async server components, no MDXRemote. This is what makes
  // the new architecture stable across server→client transitions.
  const { content: rawMdx } = readMdxRaw(project.mdxPath);
  const sections = splitMdxIntoSections(rawMdx);
  const sectionNavDefs = sectionsToNavDefs(sections);
  const navDefs =
    project.decision && sectionNavDefs.length > 0
      ? [
          sectionNavDefs[0],
          { id: "the-decision", label: "The Decision" },
          ...sectionNavDefs.slice(1),
        ]
      : sectionNavDefs;

  const related = getRelatedProjects(category, slug, 3);

  return (
    <ProjectDetailClient
      project={project}
      category={category}
      categoryDisplayNames={categoryDisplayNames}
      projectImages={projectImages}
      hasPortfolio={hasPortfolio}
      videoId={videoId}
      embedUrl={embedUrl}
      sections={sections}
      navDefs={navDefs}
      related={related}
    />
  );
}
