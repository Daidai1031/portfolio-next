// lib/mdx-sections.ts
import type { SectionDef } from '@/lib/section-types';

export interface MdxSection {
  /** Stable DOM id generated from the raw heading, e.g. "design-concept". */
  id: string;
  /** Raw section heading shown in the section eyebrow and left rail. */
  label: string;
  /** Markdown body for this section, with the original `## Heading` removed. */
  content: string;
}

function slugifyHeading(heading: string, fallback: string): string {
  const slug = heading
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

function uniqueId(baseId: string, usedIds: Map<string, number>): string {
  const count = usedIds.get(baseId) ?? 0;
  usedIds.set(baseId, count + 1);
  return count === 0 ? baseId : `${baseId}-${count + 1}`;
}

/**
 * Slice a raw MDX string into project-specific sections.
 *
 * Every `## Heading` becomes its own `MdxSection`; headings are no longer
 * collapsed into canonical buckets like Overview/Design/Outcome. This keeps
 * each project's custom narrative structure visible in both the page body and
 * the left section nav.
 */
export function splitMdxIntoSections(rawMdx: string): MdxSection[] {
  // The page header already renders the project title.
  const noH1 = rawMdx.replace(/^#\s+.+$/m, '').trimStart();
  const lines = noH1.split(/\r?\n/);

  type RawChunk = { heading: string; body: string[] };
  const chunks: RawChunk[] = [];
  let current: RawChunk | null = null;
  const prelude: string[] = [];

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (current) chunks.push(current);
      current = { heading: match[1].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      prelude.push(line);
    }
  }

  if (current) chunks.push(current);

  const usedIds = new Map<string, number>();
  const sections: MdxSection[] = [];
  const preludeContent = prelude.join('\n').trim();

  if (preludeContent) {
    sections.push({
      id: uniqueId('overview', usedIds),
      label: 'Overview',
      content: preludeContent,
    });
  }

  chunks.forEach((chunk, index) => {
    const content = chunk.body.join('\n').trim();
    if (!content) return;

    const baseId = slugifyHeading(chunk.heading, `section-${index + 1}`);
    sections.push({
      id: uniqueId(baseId, usedIds),
      label: chunk.heading,
      content,
    });
  });

  if (sections.length > 0) return sections;

  const fallbackContent = noH1.trim();
  return fallbackContent
    ? [{ id: 'overview', label: 'Overview', content: fallbackContent }]
    : [];
}

/**
 * Convenience: derive the SectionDef[] that ProjectSectionNav wants
 * from a list of MdxSection.
 */
export function sectionsToNavDefs(sections: MdxSection[]): SectionDef[] {
  return sections.map((section) => ({ id: section.id, label: section.label }));
}
