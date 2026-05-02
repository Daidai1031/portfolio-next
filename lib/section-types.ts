// lib/section-types.ts
// Tiny shared-type module so server-side code (lib/mdx-sections.ts) and
// client-side code (components/ProjectSectionNav.tsx) can both reference
// the same type without crossing the 'use client' boundary.

export interface SectionDef {
  id: string;
  label: string;
}