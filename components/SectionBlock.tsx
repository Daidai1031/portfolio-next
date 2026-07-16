'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  id: string;
  label: string;       // e.g. "Overview" — shown as eyebrow above the content
  index: number;       // 0-indexed position, used for the "01" tag
  total: number;
  /** Raw markdown content for this section. Rendered client-side via
   *  ReactMarkdown so we never have to push React nodes across the
   *  server→client boundary (that was the source of the previous crash). */
  content: string;
}

/**
 * One block of the project body. Self-contained client component that:
 *   - renders an `<section id>` anchor (so ProjectSectionNav can scroll-target it)
 *   - shows a numbered orange eyebrow ("01  Overview") above its content
 *   - renders the markdown content via ReactMarkdown
 * Content is visible in the server-rendered HTML. Animation should never be
 * required for readability; otherwise a hydration/runtime issue can leave the
 * entire project narrative stuck at opacity: 0.
 */
export default function SectionBlock({ id, label, index, total, content }: Props) {
  void total;

  return (
    <section
      id={id}
      className="project-section relative"
      style={{
        scrollMarginTop: '96px',
        paddingTop: index === 0 ? 0 : '1.25rem',
        marginTop: index === 0 ? 0 : '2rem',
      }}
    >
      {/* Section divider — drawn above sections 2+, omitted for first */}
      {index > 0 && (
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 flex items-center gap-4"
        >
          <span className="w-6 h-px bg-orange-500" />
          <span className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* Eyebrow — index + label */}
      <div className="flex max-w-full items-center mb-6 lg:mb-7">
        <span className="inline-flex min-w-0 max-w-full whitespace-normal break-words bg-orange-500 px-4 py-2 text-base font-bold leading-tight text-white lg:px-5 lg:py-2.5 lg:text-lg">
          {label}
        </span>
      </div>

      {/* Body content. ReactMarkdown turns the raw markdown string into
          React elements. Styling is handled by the surrounding
          .project-detail-body CSS rules in globals.css — there is no
          per-element JSX customization needed because the user's MDX
          files don't import any custom React components, just plain
          markdown features (headings, lists, tables, code blocks). */}
      <div className="project-section-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}
