// app/projects/[category]/[slug]/page.tsx
import { notFound } from "next/navigation";
import PrevNext from "@/components/PrevNext";
import { getProjectByCategorySlug, getPrevNext } from "@/lib/projects";
import { absFromProjectRoot, renderMdxFromFile } from "@/lib/mdx";
import { makeMdxComponents } from "@/components/mdx/Blocks";

export default async function ProjectPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const { category, slug } = params;

  const project = getProjectByCategorySlug(category, slug);
  if (!project) return notFound();

  const { prev, next } = getPrevNext(category, slug);

  // mdxPath 是 build_projects_index.py 写进去的相对路径：content/projects/...
  const mdxAbsPath = absFromProjectRoot(project.mdxPath);

  const mdxComponents = makeMdxComponents({
    assetBase: `/projects/${category}/${slug}`,
    heroUrl: project.heroUrl ?? null,
    galleryUrls: project.galleryUrls ?? [],
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <div className="text-xs uppercase tracking-wider text-neutral-500">
          {project.category}
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {project.title}
        </h1>

        {project.subtitle ? (
          <p className="mt-2 text-neutral-400">{project.subtitle}</p>
        ) : null}

        <div className="mt-4 text-sm text-neutral-500">
          {[project.location, project.date ?? project.year]
            .filter(Boolean)
            .join(" · ")}
        </div>

        {/* 可选：自动插入 hero（也可在 MDX 用 <Hero/>） */}
        {project.heroUrl ? (
          <div className="mt-8">{mdxComponents.Hero()}</div>
        ) : null}
      </header>

      <article className="prose prose-invert max-w-none">
        {await renderMdxFromFile(mdxAbsPath, mdxComponents)}
      </article>

      <PrevNext prev={prev} next={next} />
    </main>
  );
}
