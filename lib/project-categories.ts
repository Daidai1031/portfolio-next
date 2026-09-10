export const projectCategories = [
  "software",
  "tangible",
  "creative",
  "built",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

// Short display title for each category.
export const categoryNames: Record<ProjectCategory, string> = {
  software: "Software",
  tangible: "Tangible",
  creative: "Creative",
  built: "Built",
};

// Descriptive subtitle shown alongside the short title.
export const categorySubtitles: Record<ProjectCategory, string> = {
  software: "AI & Digital Products",
  tangible: "Physical Computing & Devices",
  creative: "Motion & HCI Research",
  built: "Architecture & Fabrication",
};

// Keep the existing order used by the grouped "All" view.
export const projectSectionOrder: readonly ProjectCategory[] = [
  "tangible",
  "software",
  "creative",
  "built",
];

// Old category slugs kept for redirects and backward-compatible lookups.
export const legacyCategorySlugs: Record<string, ProjectCategory> = {
  "physical-computing": "tangible",
  "ai-digital-products": "software",
  "creative-media": "creative",
  "architecture-fabrication": "built",
};

export function isProjectCategory(
  value: string | null,
): value is ProjectCategory {
  return projectCategories.includes(value as ProjectCategory);
}
