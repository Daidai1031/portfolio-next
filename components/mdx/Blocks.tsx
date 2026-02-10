// components/mdx/Blocks.tsx
import Image from 'next/image';
import type { Project } from '@/lib/projects';

export function makeMdxComponents(project: Project) {
  return {
    img: (props: any) => {
      if (!props.src) return null;
      
      // 如果是相对路径，添加项目路径前缀
      const src = props.src.startsWith('/') 
        ? props.src 
        : `/projects/${project.category}/${project.slug}/${props.src}`;
      
      return (
        <Image
          src={src}
          alt={props.alt || ''}
          width={800}
          height={600}
          className="w-full h-auto rounded-lg my-8"
        />
      );
    },
  };
}
