// app/projects/[category]/[slug]/ProjectDetailClient.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from "lucide-react";

const NAV_PADDING = "clamp(24px, 10vw, 144px)";

interface ProjectDetailClientProps {
  project: any;
  category: string;
  categoryDisplayNames: Record<string, string>;
  projectImages: {
    portfolio: string[];
    gallery: string[];
  };
  hasPortfolio: boolean;
  videoId: string | null;
  mdxContent: any;
  prev: any;
  next: any;
}

export default function ProjectDetailClient({
  project,
  category,
  categoryDisplayNames,
  projectImages,
  hasPortfolio,
  videoId,
  mdxContent,
  prev,
  next,
}: ProjectDetailClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll fade-in observer
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    // Add lines-ready so dividers appear once the article is in view
    el.classList.add('lines-ready');

    const sections = el.querySelectorAll<HTMLElement>('.fade-in-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    sections.forEach((s) => observer.observe(s));
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  };

  return (
    <div className="min-h-screen bg-white text-black" ref={bodyRef}>
      {/* Navigation */}
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
          <Image
            src={project.heroUrl}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="py-6 lg:py-20"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        {/* Mobile: single column layout */}
        <div className="lg:hidden">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-orange-500">Projects</Link>
            <span>/</span>
            <Link href={`/categories/${category}`} className="hover:text-orange-500 capitalize">
              {categoryDisplayNames[category] || category}
            </Link>
            <span>/</span>
            <span className="text-black truncate max-w-[100px]">{project.title}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">{project.title}</h1>
          {project.subtitle && (
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{project.subtitle}</p>
          )}

          {/* Meta */}
          <div className="grid grid-cols-3 gap-2 mb-6 pb-6 border-b border-gray-200">
            {project.year && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Year</p>
                <p className="text-xs font-medium">{project.year}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Location</p>
                <p className="text-xs font-medium leading-tight">{project.location}</p>
              </div>
            )}
            {project.role && project.role.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Role</p>
                <p className="text-xs font-medium leading-tight">{project.role[0]}</p>
              </div>
            )}
          </div>

          {/* Video (mobile) */}
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

          {/* Portfolio images (mobile) */}
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
                    <Image
                      src={imageUrl}
                      alt={`${project.title} - Portfolio ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="78vw"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      {index + 1}/{projectImages.portfolio.length}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Tap to enlarge • Scroll to view</p>
            </div>
          )}

          {/* MDX Content */}
          <article className="prose-sm max-w-none">
            {mdxContent}
          </article>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block">

          {/* Full-width header: breadcrumb + title + meta */}
          <div className="mb-32 pb-32 fade-in-section">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-16">
              <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/projects" className="hover:text-orange-500 transition-colors">Projects</Link>
              <span>/</span>
              <Link href={`/categories/${category}`} className="hover:text-orange-500 transition-colors capitalize">
                {categoryDisplayNames[category as keyof typeof categoryDisplayNames] || category}
              </Link>
              <span>/</span>
              <span className="text-black">{project.title}</span>
            </div>

            {/* Centered title + subtitle — w-full ensures text-center works */}
            <div className="w-full text-center mb-16">
              <h1 className="text-6xl font-bold mb-6 leading-tight">{project.title}</h1>
              {project.subtitle && (
                <p className="text-xl text-gray-500 leading-relaxed">{project.subtitle}</p>
              )}
            </div>

            {/* Centered meta row */}
            <div className="w-full flex items-start justify-center gap-24">
              {project.year && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Year</p>
                  <p className="font-medium">{project.year}</p>
                </div>
              )}
              {project.location && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
              )}
              {project.role && project.role.length > 0 && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Role</p>
                  <p className="font-medium">{project.role.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="h-9" />

          {/* Two-column: MDX body + media */}
          <div className="grid gap-20 mb-0" style={{ gridTemplateColumns: '2.5fr 3fr' }}>
            {/* Left - MDX body */}
            <div className="lg:pr-10">
              <div className="project-detail-body lines-ready">
                <article className="max-w-none fade-in-section">{mdxContent}</article>
              </div>
            </div>

            {/* Right - Video/Portfolio + Gallery (Sticky) */}
            <div className="lg:pl-10">
              <div className="sticky top-32">
              {videoId && (
                <div className="fade-in-section">
                  <h2 className="text-2xl font-bold mb-6">Video</h2>
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
                <div className="fade-in-section mt-25">
                  <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
                  <div className="relative">
                    <div className="horizontal-scroll pb-4 -mx-4 px-4">
                      {projectImages.portfolio.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-[85%] relative bg-gray-100 overflow-hidden rounded-lg group cursor-pointer"
                          style={{ aspectRatio: '4/3' }}
                          onClick={() => openLightbox(projectImages.portfolio, index)}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${project.title} - Portfolio ${index + 1}`}
                            fill
                            className="object-contain transition-all duration-300 group-hover:scale-105"
                            sizes="85vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                            {index + 1} / {projectImages.portfolio.length}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-4 text-sm text-gray-400 flex items-center justify-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Click to enlarge • Scroll to view
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="h-16" />

              {/* Gallery — desktop only, inside right column */}
              {projectImages.gallery.length > 0 && (
                <div className="fade-in-section mt-25">
                  <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                  <div className="relative">
                    <div className="horizontal-scroll pb-4 -mx-4 px-4">
                      {projectImages.gallery.map((url, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-[85%] relative bg-gray-100 overflow-hidden rounded-lg group cursor-pointer"
                          style={{ aspectRatio: '4/3' }}
                          onClick={() => openLightbox(projectImages.gallery, index)}
                        >
                          <Image
                            src={url}
                            alt={`${project.title} - Gallery ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                            {index + 1} / {projectImages.gallery.length}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-4 text-sm text-gray-400 flex items-center justify-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Click to enlarge • Scroll to view
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section — mobile only */}
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
                  <Image
                    src={url}
                    alt={`${project.title} - Gallery ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prev/Next Navigation */}
      {(prev || next) && (
        <div className="py-10 lg:py-20">
          <div style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
            <div className="pt-8 lg:pt-12 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-6 lg:gap-12">
                {prev ? (
                  <Link href={prev.url} className="group">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 lg:mb-3">Previous</p>
                    <h3 className="text-sm lg:text-xl font-bold group-hover:text-orange-500 transition-colors flex items-center gap-1 lg:gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="line-clamp-2">{prev.title}</span>
                    </h3>
                  </Link>
                ) : <div></div>}
                
                {next ? (
                  <Link href={next.url} className="group text-right">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 lg:mb-3">Next</p>
                    <h3 className="text-sm lg:text-xl font-bold group-hover:text-orange-500 transition-colors flex items-center justify-end gap-1 lg:gap-2">
                      <span className="line-clamp-2">{next.title}</span>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </h3>
                  </Link>
                ) : <div></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
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
            <Image
              src={lightboxImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
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