// app/projects/[category]/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getProjectByCategorySlug, getPrevNext, getAllProjects } from "@/lib/projects";
import { absFromProjectRoot, renderMdxFromFile } from "@/lib/mdx";
import { notFound } from "next/navigation";

// 分类显示名称映射
const categoryDisplayNames: Record<string, string> = {
  'hci': 'Computational Interaction',
  'architecture': 'Architecture',
  'fabrication': 'Fabrication',
  'urban-interaction': 'Urban'
};

// ⭐ 生成所有静态路径
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
    // 可以添加自定义组件
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  // 解包 Promise
  const { category, slug } = await params;
  
  const project = getProjectByCategorySlug(category, slug);
  
  if (!project) {
    notFound();
  }

  const { prev, next } = getPrevNext(category, slug);
  const mdxAbsPath = project.mdxPath;
  const mdxComponents = makeMdxComponents(project);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation - 144px 边距 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div style={{ paddingLeft: '144px', paddingRight: '144px', paddingTop: '24px', paddingBottom: '24px' }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            
            <div className="flex items-center gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-orange-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      {project.heroUrl && (
        <div className="relative h-[60vh] w-full mt-20">
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

      {/* Content - 144px 边距 */}
      <div className="py-20" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-12">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-orange-500 transition-colors">Projects</Link>
            <span>/</span>
            <Link href={`/categories/${category}`} className="hover:text-orange-500 transition-colors capitalize">
              {categoryDisplayNames[category as keyof typeof categoryDisplayNames] || category}
            </Link>
            <span>/</span>
            <span className="text-black">{project.title}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-8">{project.title}</h1>
          
          {/* Subtitle */}
          {project.subtitle && (
            <p className="text-xl text-gray-600 mb-16 leading-relaxed">{project.subtitle}</p>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20 pb-10 border-b border-gray-200">
            {project.year && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Year</p>
                <p className="font-medium text-lg">{project.year}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Location</p>
                <p className="font-medium text-lg">{project.location}</p>
              </div>
            )}
            {project.role && project.role.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Role</p>
                <p className="font-medium text-lg">{project.role.join(', ')}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Category</p>
              <p className="font-medium text-lg capitalize">
                {categoryDisplayNames[project.category as keyof typeof categoryDisplayNames] || project.category}
              </p>
            </div>
          </div>

          {/* MDX Content */}
          <article className="prose prose-lg prose-gray max-w-none mb-20">
            {await renderMdxFromFile(mdxAbsPath, mdxComponents)}
          </article>

          {/* Gallery */}
          {project.galleryUrls && project.galleryUrls.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold mb-10">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {project.galleryUrls.map((url, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 overflow-hidden rounded-lg">
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
            <div className="pt-16 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {prev && (
                  <Link href={prev.url} className="group">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Previous Project</p>
                    <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {prev.title}
                    </h3>
                  </Link>
                )}
                {next && (
                  <Link href={next.url} className="group text-right">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Next Project</p>
                    <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors flex items-center justify-end gap-2">
                      {next.title}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </h3>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - 144px 边距 */}
      <footer className="border-t border-gray-200 py-16 bg-gray-50 mt-32" style={{ paddingLeft: '144px', paddingRight: '144px' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <Link href="/projects" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
            ← Back to Projects
          </Link>
        </div>
      </footer>
    </div>
  );
}