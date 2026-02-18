// components/MobileProjectCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useInView } from '@/hooks/useInView';

interface MobileProjectCardProps {
  href: string;
  heroUrl?: string | null;
  title: string;
  subtitle?: string;
  year?: number;
  category?: string;
  index: number;
  /** 'list' = full-width stacked (homepage), 'grid' = 2-col grid (all projects) */
  variant?: 'list' | 'grid';
}

export default function MobileProjectCard({
  href,
  heroUrl,
  title,
  subtitle,
  year,
  category,
  index,
  variant = 'list',
}: MobileProjectCardProps) {
  const { ref, inView } = useInView(0.45);

  if (variant === 'grid') {
    return (
      <Link href={href} className="group">
        <div ref={ref} className="relative bg-gray-100 mb-2 overflow-hidden rounded-md" style={{ aspectRatio: '4/3' }}>
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={title}
              fill
              className={`object-cover transition-all duration-700 ${inView ? 'grayscale-0 scale-[1.03]' : 'grayscale'}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
          <div className="absolute top-1.5 left-1.5 text-xl font-bold text-white/20">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-gray-400">{year}</span>
          <h3 className="text-xs font-bold group-hover:text-orange-500 transition-colors leading-tight line-clamp-2">
            {title}
          </h3>
        </div>
      </Link>
    );
  }

  // variant === 'list'
  return (
    <Link href={href} className="group">
      <div ref={ref} className="relative aspect-[4/3] bg-gray-100 mb-4 overflow-hidden rounded-lg">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={title}
            fill
            className={`object-cover transition-all duration-700 ${inView ? 'grayscale-0 scale-[1.02]' : 'grayscale'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <div className="absolute top-4 left-4 text-5xl font-bold text-white/20">
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {category && (
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">{category}</span>
          )}
          <span className="text-xs text-gray-400">{year}</span>
        </div>
        <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </Link>
  );
}
