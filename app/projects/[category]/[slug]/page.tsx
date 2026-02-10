// app/projects/[category]/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getProjectByCategorySlug, getPrevNext, getAllProjects } from "@/lib/projects";
import { absFromProjectRoot, renderMdxFromFile } from "@/lib/mdx";
import { notFound } from "next/navigation";

// ⭐ 关键：生成所有静态路径
export async function generateStaticParams() {
  const projects = getAllProjects();
  
  return projects.map((project) => ({
    category: project.category,
    slug: project.slug,
  }));
}

// 自定义 MDX 组件
function makeMdxComponents(project: any) {
  return {
    // 可以留空，或添加自定义组件
  };
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
        <div className="relative h-[60vh] w-full mt-16">
          <Image
            src={project.heroUrl}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-12 md:px-16 lg:px-20 xl:px-24 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-orange-500">Projects</Link>
          <span>/</span>
          <Link href={`/categories/${params.category}`} className="hover:text-orange-500 capitalize">
            {params.category}
          </Link>
          <span>/</span>
          <span className="text-black">{project.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6">{project.title}</h1>
        
        {/* Subtitle */}
        {project.subtitle && (
          <p className="text-xl text-gray-600 mb-12">{project.subtitle}</p>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-8 border-b border-gray-200">
          {project.year && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Year</p>
              <p className="font-medium">{project.year}</p>
            </div>
          )}
          {project.location && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Location</p>
              <p className="font-medium">{project.location}</p>
            </div>
          )}
          {project.role && project.role.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Role</p>
              <p className="font-medium">{project.role.join(', ')}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Category</p>
            <p className="font-medium capitalize">{project.category}</p>
          </div>
        </div>

        {/* MDX Content */}
        <article className="prose prose-lg prose-gray max-w-none">
          {await renderMdxFromFile(mdxAbsPath, mdxComponents)}
        </article>

        {/* Gallery */}
        {project.galleryUrls && project.galleryUrls.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.galleryUrls.map((url, index) => (
                <div key={index} className="relative aspect-video bg-gray-100 overflow-hidden">
                  <Image
                    src={url}
                    alt={`${project.title} - Image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation to Prev/Next */}
        {(prev || next) && (
          <div className="mt-20 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {prev && (
                <Link href={prev.url} className="group">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Previous Project</p>
                  <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">
                    ← {prev.title}
                  </h3>
                </Link>
              )}
              {next && (
                <Link href={next.url} className="group text-right">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Next Project</p>
                  <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">
                    {next.title} →
                  </h3>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-12 md:px-16 lg:px-20 xl:px-24 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 Dingran Dai. All rights reserved.</p>
          <Link href="/projects" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
            ← Back to Projects
          </Link>
        </div>
      </footer>
    </div>
  );
}