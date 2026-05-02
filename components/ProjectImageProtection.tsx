'use client';

import { useEffect } from 'react';

function isProjectImage(img: HTMLImageElement | null) {
  if (!img) return false;

  const sources = [
    img.currentSrc,
    img.src,
    img.getAttribute('src') ?? '',
    img.getAttribute('srcset') ?? '',
  ];

  return sources.some(
    (source) =>
      source.includes('/projects/') ||
      source.includes('%2Fprojects%2F') ||
      source.includes('%2fprojects%2f'),
  );
}

function getImageFromEvent(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  return target.closest('img');
}

export default function ProjectImageProtection() {
  useEffect(() => {
    const protectImage = (img: HTMLImageElement) => {
      if (!isProjectImage(img)) return;
      img.draggable = false;
      img.dataset.protectedProjectImage = 'true';
      if (!img.title) {
        img.title = 'Project image © Dingran Dai. All rights reserved.';
      }
    };

    const protectExistingImages = () => {
      document.querySelectorAll<HTMLImageElement>('img').forEach(protectImage);
    };

    const preventProtectedImageAction = (event: Event) => {
      const img = getImageFromEvent(event);
      if (!isProjectImage(img)) return;
      event.preventDefault();
    };

    protectExistingImages();

    const observer = new MutationObserver(() => protectExistingImages());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset'],
    });

    document.addEventListener('contextmenu', preventProtectedImageAction, true);
    document.addEventListener('dragstart', preventProtectedImageAction, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('contextmenu', preventProtectedImageAction, true);
      document.removeEventListener('dragstart', preventProtectedImageAction, true);
    };
  }, []);

  return null;
}
