'use client';

import { trackEvent } from '@/lib/gtm';
import type { ProjectFeature } from '@/lib/projects';

interface FeaturedBadgeProps {
  feature: ProjectFeature;
  projectSlug: string;
  className?: string;
}

export default function FeaturedBadge({ feature, projectSlug, className = '' }: FeaturedBadgeProps) {
  const meta = [feature.publisher, feature.date].filter(Boolean).join(' · ');

  return (
    <a
      href={feature.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('featured_in_click', { project: projectSlug, publication: feature.publication })}
      className={`group inline-flex items-stretch border border-gray-200 hover:border-orange-500 transition-colors duration-200 text-left ${className}`}
    >
      <span className="flex items-center bg-orange-500 text-white text-[10px] font-semibold uppercase tracking-[0.14em] px-3">
        Featured in
      </span>
      <span className="flex flex-col justify-center px-4 py-2.5">
        <span className="text-sm font-semibold text-black leading-snug group-hover:text-orange-500 transition-colors duration-200">
          {feature.publication} <span aria-hidden="true">↗</span>
        </span>
        {meta && <span className="text-[11px] text-gray-500 leading-snug mt-0.5">{meta}</span>}
        {feature.note && <span className="text-[11px] text-gray-400 leading-snug mt-0.5">{feature.note}</span>}
      </span>
    </a>
  );
}
