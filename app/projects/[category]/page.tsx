// app/categories/[category]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getProjectsByCategory, getAllProjects } from "@/lib/projects";
import { notFound } from "next/navigation";

// 生成静态路径
export async function generateStaticParams() {
  const projects = getAllProjects();
  const categories = [...new Set(projects.map(p => p.category))];
  
  return categories.map(category => ({
    category: category,
  }));
}

const categoryInfo = {
  'hci': {
    name: 'Computational Interaction',
    description: 'Exploring the intersection of design, technology, and human behavior through interactive experiences and data-driven design.',
    color: 'orange-500'
  },
  'urban-interaction': {
    name: 'Urban',
    description: 'Designing interactive urban experiences that connect people with their cities through technology and participatory design.',
    color: 'orange-500'
  },
  'fabrication': {
    name: 'Fabrication',
    description: 'Digital fabrication and material exploration pushing the boundaries of traditional making through computational design.',
    color: 'orange-500'
  },
  'architecture': {
    name: 'Architecture',
    description: 'Spatial design projects that reimagine urban environments and cultural spaces through innovative architectural solutions.',
    color: 'orange-500'
  }
};

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const projects = getProjectsByCategory(params.category);
  
  if (projects.length === 0) {
    notFound();
  }

  const info = categoryInfo[params.category as keyof typeof categoryInfo] || {
    name: params.category,
    description: '',
    color: 'orange-500'
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-orange-500 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-orange-500 transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-black">{info.name}</span>
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">
                Category
              </p>
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                {info.name.split(' ').map((word, i) => (
                  <span key={i}>
                    {i === info.name.split(' ').length - 1 ? (
                      <span className="text-orange-500">{word}</span>
                    ) : (
                      <>
                        {word}
                        <br />
                      </>
                    )}
                  </span>
                ))}
              </h1>
            </div>

            <div className="flex flex-col justify-end">
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {info.description}
              </p>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="text-sm text-gray-500">
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {projects.map((project, index) => (
              <Link
                key={project.slug}
                href={project.url}
                className="group"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-gray-100 mb-6 overflow-hidden">
                  {project.heroUrl ? (
                    <Image
                      src={project.heroUrl}
                      alt={project.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  )}
                  
                  {/* Number Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl font-bold text-white/10 group-hover:text-orange-500/20 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Year Badge */}
                  {project.year && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium">
                      {project.year}
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">
                    {project.title}
                  </h3>
                  
                  {project.subtitle && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.subtitle}
                    </p>
                  )}

                  {/* Tags */}
                  {project.role && project.role.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.role.slice(0, 2).map((r, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Other Categories */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Explore Other Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(categoryInfo)
              .filter(([cat]) => cat !== params.category)
              .map(([cat, info]) => (
                <Link
                  key={cat}
                  href={`/categories/${cat}`}
                  className="group p-8 bg-white border border-gray-200 hover:border-orange-500 transition-all"
                >
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                    {info.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {info.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Projects
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2024 Dingran Dai. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/projects"
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
            >
              All Projects
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}