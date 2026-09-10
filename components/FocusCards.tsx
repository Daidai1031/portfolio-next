'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type FocusCategory = {
  slug: string;
  name: string;
  subtitle?: string;
  heroUrl?: string | null;
};

export default function FocusCards({ categories }: { categories: FocusCategory[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <div
      className="focus-deck"
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) {
          setActiveSlug(null);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveSlug(null);
      }}
    >
      {categories.map((category, index) => (
        <Link
          key={category.slug}
          href={`/projects?category=${category.slug}`}
          className={`focus-card${activeSlug === category.slug ? ' is-active' : ''}`}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') setActiveSlug(category.slug);
          }}
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible')) setActiveSlug(category.slug);
          }}
          onClick={(event) => {
            // On touch screens, the first tap reveals the card; the next follows its link.
            if (window.matchMedia('(hover: none)').matches && activeSlug !== category.slug) {
              event.preventDefault();
              setActiveSlug(category.slug);
            }
          }}
        >
          <div className="focus-card-image" aria-hidden>
            {category.heroUrl && (
              <Image
                src={category.heroUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, 85vw"
                className="object-cover"
              />
            )}
            <div className="focus-card-shade" />
          </div>
          <span className="focus-card-corner focus-card-corner-start" aria-hidden />
          <span className="focus-card-corner focus-card-corner-end" aria-hidden />
          <span className="focus-card-number" aria-hidden>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="focus-card-content">
            <h3>{category.name}</h3>
            {category.subtitle && <p className="focus-card-subtitle">{category.subtitle}</p>}
            <span className="focus-card-explore">
              Explore
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
