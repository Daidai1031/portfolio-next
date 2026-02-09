// lib/mdx.tsx
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { readFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

// 获取项目根目录的绝对路径
export function absFromProjectRoot(...paths: string[]): string {
  return join(process.cwd(), ...paths)
}

// 从文件读取并渲染 MDX（返回 React 组件）
export async function renderMdxFromFile(filePath: string, components?: any) {
  const fullPath = absFromProjectRoot(filePath)
  const fileContent = readFileSync(fullPath, 'utf-8')
  
  // 解析 frontmatter
  const { content } = matter(fileContent)
  
  // 返回渲染后的 MDX 组件
  return (
    <MDXRemote
      source={content}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
      components={components}
    />
  )
}

// MDX 内容组件（如果其他地方需要用）
interface MDXContentProps {
  source: string
  components?: any
}

export function MDXContent({ source, components }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
      components={components}
    />
  )
}