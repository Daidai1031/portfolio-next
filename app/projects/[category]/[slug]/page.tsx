// app/projects/[category]/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getProjectByCategorySlug, getPrevNext, getAllProjects } from "@/lib/projects";
import { absFromProjectRoot, renderMdxFromFile } from "@/lib/mdx";
import { makeMdxComponents } from "@/components/mdx/Blocks";
import { notFound } from "next/navigation";

// ⭐ 关键：生成所有静态路径
export async function generateStaticParams() {
  const projects = getAllProjects();
  
  return projects.map((project) => ({
    category: project.category,
    slug: project.slug,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const project = getProjectByCategorySlug(params.category, params.slug);
  
  if (!project) {
    notFound();
  }

  const { prev, next } = getPrevNext(params.category, params.slug);
  const mdxAbsPath = project.mdxPath;
  const mdxComponents = makeMdxComponents(project);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="w-full px-12 md:px-16 lg:px-20 xl:px-24 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            DINGRAN DAI
          </Link>
          
          <div className="flex items-center gap-8">
            <Link href="/projects" className="text-sm hover:text-orange-500 transition-colors">
              Projects
            </Link>
            <Link href="/about" className="text-sm hover:text-orange-500 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm hover:text-orange-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      {project.heroUrl && (
        <div className="relative h-96 w-full mt-16">
          <Image
            src={project.heroUrl}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-12 md:px-16 lg:px-20 xl:px-24 py-12">
        <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
        {project.subtitle && (
          <p className="text-xl text-gray-600 mb-8">{project.subtitle}</p>
        )}

        <article className="prose prose-lg max-w-none">
          {await renderMdxFromFile(mdxAbsPath, mdxComponents)}
        </article>
      </div>
    </div>
  );
}