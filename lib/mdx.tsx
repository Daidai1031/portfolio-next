// lib/mdx.tsx
//
// This file used to expose `renderMdxFromFile()` and a `MDXContent`
// component built on `next-mdx-remote/rsc`. The new architecture renders
// markdown content client-side via ReactMarkdown inside SectionBlock, so
// those exports are gone — but we keep `readMdxRaw()` because it's how
// the page component pulls the raw markdown string off disk before
// passing it through `splitMdxIntoSections()`.

import { readFileSync } from 'fs';
import { join, normalize, sep } from 'path';
import matter from 'gray-matter';

export function absFromProjectContent(filePath: string): string {
  const normalized = normalize(filePath);
  const contentPrefix = `content${sep}projects${sep}`;
  const relativeProjectPath = normalized.startsWith(contentPrefix)
    ? normalized.slice(contentPrefix.length)
    : normalized;

  if (
    relativeProjectPath.startsWith('..') ||
    relativeProjectPath.includes(`${sep}..${sep}`) ||
    !relativeProjectPath.endsWith('.mdx')
  ) {
    throw new Error(`Invalid project MDX path: ${filePath}`);
  }

  return join(process.cwd(), 'content', 'projects', relativeProjectPath);
}

/**
 * Read an MDX file from disk and return both the raw content (for the
 * section splitter) and the parsed frontmatter.
 */
export function readMdxRaw(
  filePath: string,
): { content: string; frontmatter: Record<string, any> } {
  const fullPath = absFromProjectContent(filePath);
  const fileContent = readFileSync(fullPath, 'utf-8');
  const { content, data } = matter(fileContent);
  return { content, frontmatter: data };
}
