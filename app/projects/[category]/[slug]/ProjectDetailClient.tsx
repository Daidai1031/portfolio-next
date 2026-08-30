// app/projects/[category]/[slug]/ProjectDetailClient.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X } from "lucide-react";
import ProjectSectionNav from '@/components/ProjectSectionNav';
import SectionBlock from '@/components/SectionBlock';
import DecisionCard from '@/components/DecisionCard';
import RelatedProjects from '@/components/RelatedProjects';
import type { SectionDef } from '@/lib/section-types';
import type { MdxSection } from '@/lib/mdx-sections';
import type { Project } from '@/lib/projects';

const NAV_PADDING = "clamp(48px, 12vw, 176px)";

interface ProjectDetailClientProps {
  project: Project;
  category: string;
  categoryDisplayNames: Record<string, string>;
  projectImages: {
    portfolio: string[];
    gallery: string[];
  };
  hasPortfolio: boolean;
  videoId: string | null;
  embedUrl: string | null;
  /** Plain serializable section data — content is a markdown string. */
  sections: MdxSection[];
  navDefs: SectionDef[];
  related: Project[];
}

/* ─── Staggered Two-Column Gallery ─── */
function AdaptiveGallery({
  images,
  title,
  onImageClick,
}: {
  images: string[];
  title: string;
  onImageClick: (images: string[], index: number) => void;
}) {
  const [dimensions, setDimensions] = useState<
    Record<string, { w: number; h: number; ratio: number }>
  >({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (images.length === 0) return;
    let cancelled = false;
    const dims: Record<string, { w: number; h: number; ratio: number }> = {};
    let count = 0;

    images.forEach((src) => {
      const img = new window.Image();
      img.onload = () => {
        if (cancelled) return;
        dims[src] = {
          w: img.naturalWidth,
          h: img.naturalHeight,
          ratio: img.naturalWidth / img.naturalHeight,
        };
        count++;
        if (count === images.length) {
          setDimensions(dims);
          setLoaded(true);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        dims[src] = { w: 4, h: 3, ratio: 4 / 3 };
        count++;
        if (count === images.length) {
          setDimensions(dims);
          setLoaded(true);
        }
      };
      img.src = src;
    });

    return () => { cancelled = true; };
  }, [images]);

  if (images.length === 0) return null;

  const buildColumns = (): [string[], string[]] => {
    const left: string[] = [];
    const right: string[] = [];
    let leftH = 0;
    let rightH = 0;
    images.forEach((src) => {
      const d = dimensions[src];
      const h = d ? 1 / d.ratio : 0.75;
      if (leftH <= rightH) { left.push(src); leftH += h; }
      else { right.push(src); rightH += h; }
    });
    return [left, right];
  };

  const [leftCol, rightCol] = loaded ? buildColumns() : [[], []];

  const renderImage = (src: string, sizes: string = '25vw') => {
    const d = dimensions[src];
    const globalIdx = images.indexOf(src);
    return (
      <div
        key={src}
        className="relative overflow-hidden bg-gray-50 group cursor-pointer"
        style={{ aspectRatio: d ? `${d.w}/${d.h}` : '4/3' }}
        onClick={() => onImageClick(images, globalIdx)}
      >
        <Image
          src={src}
          alt={`${title} - ${globalIdx + 1}`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          sizes={sizes}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {globalIdx + 1} / {images.length}
        </div>
      </div>
    );
  };

  // Single image — no columns to balance, so let it fill the gallery's width.
  if (images.length === 1) {
    const src = images[0];
    const d = dimensions[src];
    return (
      <>
        {!loaded && (
          <div className="bg-gray-100 animate-pulse w-full" style={{ aspectRatio: '4/3' }} />
        )}
        {loaded && renderImage(src, '45vw')}
      </>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="grid grid-cols-2 gap-5">
          {images.slice(0, 4).map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse" style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/3' }} />
          ))}
        </div>
      )}
      {loaded && (
        <div className="grid grid-cols-2 gap-5 items-start">
          <div className="flex flex-col gap-5">{leftCol.map((src) => renderImage(src))}</div>
          <div className="flex flex-col gap-5 pt-10">{rightCol.map((src) => renderImage(src))}</div>
        </div>
      )}
    </>
  );
}

/* ─── Full-Width Snap Carousel for Portfolio ─── */
function FullWidthCarousel({
  images,
  title,
  onImageClick,
}: {
  images: string[];
  title: string;
  onImageClick: (images: string[], index: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.clientWidth;
      const idx = Math.round(scrollLeft / width);
      setCurrentIndex(Math.max(0, Math.min(idx, images.length - 1)));
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [images.length]);

  const scrollTo = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    container.scrollTo({ left: clamped * container.clientWidth, behavior: 'smooth' });
  };

  if (images.length === 0) return null;

  return (
    <div className="relative group/carousel">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((src, index) => (
          <div
            key={src}
            className="flex-shrink-0 w-full snap-center relative bg-gray-50 cursor-pointer"
            style={{ aspectRatio: '4/3' }}
            onClick={() => onImageClick(images, index)}
          >
            <Image src={src} alt={`${title} - Portfolio ${index + 1}`} fill className="object-contain" sizes="50vw" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); scrollTo(currentIndex - 1); }}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-black hover:border-gray-400 transition-all duration-300 ${
              currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/carousel:opacity-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); scrollTo(currentIndex + 1); }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-black hover:border-gray-400 transition-all duration-300 ${
              currentIndex === images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover/carousel:opacity-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`transition-all duration-300 ${
                  i === currentIndex ? 'w-5 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 ml-1">{currentIndex + 1} / {images.length}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function ProjectDetailClient({
  project,
  category,
  categoryDisplayNames,
  projectImages,
  hasPortfolio,
  videoId,
  embedUrl,
  sections,
  navDefs,
  related,
}: ProjectDetailClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Right-column sticky media stack uses a separate fade-in observer.
  // SectionBlock manages its own per-section fade.
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const fadeTargets = el.querySelectorAll<HTMLElement>('.fade-in-section');
    if (!fadeTargets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    fadeTargets.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? lightboxImages.length - 1 : prev - 1);
  };
  const nextImage = () => {
    setCurrentImageIndex((prev) => prev === lightboxImages.length - 1 ? 0 : prev + 1);
  };
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  }, [lightboxOpen]);
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderSectionBlocks = (idPrefix = '') =>
    sections.flatMap((s, i) => {
      const sectionBlock = (
        <SectionBlock
          key={`${idPrefix}${s.id}`}
          id={`${idPrefix}${s.id}`}
          label={s.label}
          index={i}
          total={sections.length}
          content={s.content}
        />
      );

      if (i !== 0 || !project.decision) return [sectionBlock];

      return [
        sectionBlock,
        <DecisionCard
          key={`${idPrefix}the-decision`}
          id={`${idPrefix}the-decision`}
          decision={project.decision}
        />,
      ];
    });

  return (
    <div className="min-h-screen bg-white text-black" ref={bodyRef}>
      {/* Section nav rail — left side, desktop only */}
      <ProjectSectionNav sections={navDefs} />

      {/* Top navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="py-4 lg:py-6" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg lg:text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            <div className="hidden md:flex items-center gap-8 lg:gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">Projects</Link>
              <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">About</Link>
              <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 transition-colors">Contact</Link>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            <Link href="/projects" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
            <Link href="/about" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/about#connect" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </nav>

      {/* Hero Image */}
      {project.heroUrl && (
        <div className="relative h-[28vh] sm:h-[36vh] md:h-[60vh] w-full mt-14 lg:mt-20">
          <Image src={project.heroUrl} alt={project.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-6 lg:py-20" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>

        {/* ═══ Mobile ═══ */}
        <div className="lg:hidden">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-orange-500">Projects</Link>
            <span>/</span>
            <Link href={`/projects/${category}`} className="hover:text-orange-500 capitalize">
              {categoryDisplayNames[category] || category}
            </Link>
            <span>/</span>
            <span className="text-black truncate max-w-[100px]">{project.title}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-8 leading-tight">{project.title}</h1>
          {project.subtitle && (
            <p className="text-sm text-gray-600 mb-10 leading-relaxed">{project.subtitle}</p>
          )}
          {/* Skill pills — mobile */}
          {project.skills && project.skills.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6 mb-12">
              {project.skills.map((s: string) => (
                <span
                  key={s}
                  className="text-[10px] font-medium tracking-wide px-2 py-1 bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white transition-colors duration-200 cursor-default"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-3 mb-8 pb-6 border-b border-gray-200">
            {project.year && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Year</p>
                <p className="text-xs font-medium leading-relaxed">{project.year}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Location</p>
                <p className="text-xs font-medium leading-relaxed">{project.location}</p>
              </div>
            )}
            {project.role && project.role.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Role</p>
                <p className="text-xs font-medium leading-relaxed">{project.role[0]}</p>
              </div>
            )}
          </div>

          {embedUrl && (
            <div className="mb-6">
              <h2 className="text-base font-bold mb-3">Interactive StoryMap</h2>
              <div className="relative w-full overflow-hidden rounded-lg" style={{ height: '60vh', minHeight: '400px' }}>
                <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen allow="geolocation" title="Embedded content" />
              </div>
            </div>
          )}

          {videoId && (
            <div className="mb-6">
              <h2 className="text-base font-bold mb-3">Video</h2>
              <div className="relative w-full bg-gray-100 overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={project.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {hasPortfolio && (
            <div className="mb-6">
              <h2 className="text-base font-bold mb-3">Portfolio</h2>
              <div className="horizontal-scroll pb-3 -mx-6 px-6">
                {projectImages.portfolio.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[78vw] relative bg-gray-100 overflow-hidden rounded-lg cursor-pointer"
                    style={{ aspectRatio: '4/3' }}
                    onClick={() => openLightbox(projectImages.portfolio, index)}
                  >
                    <Image src={imageUrl} alt={`${project.title} - Portfolio ${index + 1}`} fill className="object-contain" sizes="78vw" />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      {index + 1}/{projectImages.portfolio.length}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Tap to enlarge • Scroll to view</p>
            </div>
          )}

          {/* MDX content (mobile) — sections stacked vertically */}
          <article className="prose-sm max-w-none project-detail-body">
            {renderSectionBlocks('mobile-')}
          </article>
        </div>

        {/* ═══ Desktop ═══ */}
        <div className="hidden lg:block">
          {/* Header */}
          <div className="mb-16 pb-16 fade-in-section">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-16">
              <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/projects" className="hover:text-orange-500 transition-colors">Projects</Link>
              <span>/</span>
              <Link href={`/projects/${category}`} className="hover:text-orange-500 transition-colors capitalize">
                {categoryDisplayNames[category as keyof typeof categoryDisplayNames] || category}
              </Link>
              <span>/</span>
              <span className="text-black">{project.title}</span>
            </div>

            <div className="w-full text-center mb-10">
              <h1 className="text-6xl font-bold mb-5 leading-tight">{project.title}</h1>
              {project.subtitle && (
                <p className="text-xl text-gray-500 leading-relaxed">{project.subtitle}</p>
              )}

              <div className="h-6" aria-hidden="true" />

              {/* Skill pills — desktop */}
              {project.skills && project.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4">
                  {project.skills.map((s: string) => (
                    <span
                      key={s}
                      className="text-xs font-medium tracking-wide px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white transition-colors duration-200 cursor-default"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full flex flex-wrap items-start justify-center gap-x-36 gap-y-14">
              {project.year && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Year</p>
                  <div className="h-1.5" aria-hidden="true" />
                  <p className="font-medium leading-loose">{project.year}</p>
                </div>
              )}
              {project.location && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Location</p>
                  <div className="h-1.5" aria-hidden="true" />
                  <p className="font-medium leading-loose">{project.location}</p>
                </div>
              )}
              {project.role && project.role.length > 0 && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Role</p>
                  <div className="h-1.5" aria-hidden="true" />
                  <p className="font-medium leading-loose">{project.role.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Two-column body */}
          <div className="grid gap-20 mb-0" style={{ gridTemplateColumns: '2.85fr 3fr' }}>
            <div className="lg:pr-8">
              <div className="project-detail-body">
                {renderSectionBlocks()}
              </div>
            </div>

            <div className="lg:pl-12">
              <div className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide pb-8">
                {embedUrl && (
                  <div className="fade-in-section">
                    <h2 className="text-2xl font-bold mb-6">Interactive StoryMap</h2>
                    <div className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
                      <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen allow="geolocation" title="Embedded content" />
                    </div>
                  </div>
                )}
                {embedUrl && (videoId || hasPortfolio || projectImages.gallery.length > 0) && <div className="h-24" />}

                {videoId && (
                  <div className="fade-in-section">
                    <h2 className="text-2xl font-bold mb-6">Video</h2>
                    <div className="relative w-full bg-gray-100 overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={project.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                {videoId && (hasPortfolio || projectImages.gallery.length > 0) && <div className="h-24" />}

                {hasPortfolio && (
                  <div className="fade-in-section">
                    <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                    <FullWidthCarousel images={projectImages.portfolio} title={project.title} onImageClick={openLightbox} />
                  </div>
                )}
                {hasPortfolio && projectImages.gallery.length > 0 && <div className="h-24" />}

                {projectImages.gallery.length > 0 && (
                  <div className="fade-in-section">
                    <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                    <AdaptiveGallery images={projectImages.gallery} title={project.title} onImageClick={openLightbox} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only Gallery */}
      {projectImages.gallery.length > 0 && (
        <div className="py-8 lg:hidden bg-gray-50">
          <div style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
            <h2 className="text-base font-bold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 gap-2">
              {projectImages.gallery.map((url, index) => (
                <div
                  key={index}
                  className="relative bg-gray-100 overflow-hidden rounded-md cursor-pointer"
                  style={{ aspectRatio: '4/3' }}
                  onClick={() => openLightbox(projectImages.gallery, index)}
                >
                  <Image src={url} alt={`${project.title} - Gallery ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="h-10 lg:h-14" aria-hidden />

      <RelatedProjects
        projects={related}
        currentCategory={category}
        currentSkills={project.skills ?? []}
      />

      <footer
        className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <Link href="/projects" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← Back to Projects</Link>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={closeLightbox} tabIndex={0}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute top-4 left-4 text-white text-sm lg:text-lg z-10">
            {currentImageIndex + 1} / {lightboxImages.length}
          </div>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2 lg:left-6 text-white hover:text-gray-300 z-10">
            <svg className="w-8 h-8 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative w-[90vw] h-[80vh] lg:h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={lightboxImages[currentImageIndex]} alt={`Image ${currentImageIndex + 1}`} fill className="object-contain" sizes="90vw" priority />
          </div>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2 lg:right-6 text-white hover:text-gray-300 z-10">
            <svg className="w-8 h-8 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs lg:text-sm hidden md:block">
            Use ← → keys or click arrows • ESC to close
          </div>
        </div>
      )}
    </div>
  );
}