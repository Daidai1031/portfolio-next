// app/projects/[category]/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getProjectByCategorySlug, getPrevNext, getAllProjects } from "@/lib/projects";
import { renderMdxFromFile } from "@/lib/mdx";
import { notFound } from "next/navigation";
import fs from 'fs';
import path from 'path';
import ProjectDetailClient from './ProjectDetailClient';

// 分类显示名称映射
const categoryDisplayNames: Record<string, string> = {
  'hci': 'Computational Interaction',
  'architecture': 'Architecture',
  'fabrication': 'Fabrication',
  'urban-interaction': 'Urban'
};

// 扩展 Project 类型以包含可选的 video 字段
interface ProjectWithVideo {
  video?: string;
  [key: string]: any;
}

// ⭐ 生成所有静态路径
export async function generateStaticParams() {
  const projects = getAllProjects();
  
  return projects.map((project) => ({
    category: project.category,
    slug: project.slug,
  }));
}

// 从文件系统读取项目图片和视频
function getProjectImages(category: string, slug: string) {
  const projectDir = path.join(process.cwd(), 'public', 'projects', category, slug);
  
  const images = {
    portfolio: [] as string[],
    gallery: [] as string[]
  };
  
  try {
    const files = fs.readdirSync(projectDir);
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return;
      
      const fileName = path.basename(file, ext);
      const imageUrl = `/projects/${category}/${slug}/${file}`;
      
      if (fileName.startsWith('portfolio-')) {
        images.portfolio.push(imageUrl);
      } else if (fileName.startsWith('gallery-')) {
        images.gallery.push(imageUrl);
      }
    });
    
    // 排序
    images.portfolio.sort();
    images.gallery.sort();
  } catch (error) {
    console.error(`Error reading images for ${category}/${slug}:`, error);
  }
  
  return images;
}

// 自定义 MDX 组件
function makeMdxComponents(project: any) {
  return {
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold text-black mt-12 mb-6 pb-4 border-b border-gray-200">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-black mt-10 mb-5">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
        {children}
      </h4>
    ),
    p: ({ children }: any) => (
      <p className="text-base text-gray-700 leading-relaxed mb-4">
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-black">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-700">
        {children}
      </em>
    ),
    ul: ({ children }: any) => (
      <ul className="space-y-2 my-6">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-outside ml-5 space-y-2 my-6">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-gray-700 leading-relaxed flex items-start">
        <span className="mr-3 mt-1 flex-shrink-0 text-gray-400">•</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-orange-500 pl-6 py-2 my-6 italic text-gray-600 bg-gray-50">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="my-10 border-gray-200" />
    ),
  };
}

// 从 YouTube URL 提取视频 ID
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
  // 解包 Promise
  const { category, slug } = await params;
  
  const project = getProjectByCategorySlug(category, slug);
  
  if (!project) {
    notFound();
  }

  const { prev, next } = getPrevNext(category, slug);
  const mdxAbsPath = project.mdxPath;
  const mdxComponents = makeMdxComponents(project);

  // 类型断言以访问可选的 video 字段
  const projectWithVideo = project as ProjectWithVideo;

  // 从文件系统读取图片
  const projectImages = getProjectImages(category, slug);
  
  // 判断是否有 Portfolio 图片
  const hasPortfolio = projectImages.portfolio.length > 0;
  
  // 判断是否有视频
  const videoId = projectWithVideo.video ? getYouTubeId(projectWithVideo.video) : null;

  // 渲染 MDX 内容
  const mdxContent = await renderMdxFromFile(mdxAbsPath, mdxComponents);

  return (
    <ProjectDetailClient
      project={project}
      category={category}
      categoryDisplayNames={categoryDisplayNames}
      projectImages={projectImages}
      hasPortfolio={hasPortfolio}
      videoId={videoId}
      mdxContent={mdxContent}
      prev={prev}
      next={next}
    />
  );
}