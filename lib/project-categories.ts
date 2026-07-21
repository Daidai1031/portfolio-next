export const projectCategories = [
  "ai-digital-products",
  "physical-computing",
  "creative-media",
  "architecture-fabrication",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export const categoryNames: Record<ProjectCategory, string> = {
  "ai-digital-products": "AI & Digital Products",
  "physical-computing": "Physical Computing & Devices",
  "creative-media": "Creative Media",
  "architecture-fabrication": "Architecture & Fabrication",
};

// Keep the existing order used by the grouped "All" view.
export const projectSectionOrder: readonly ProjectCategory[] = [
  "physical-computing",
  "ai-digital-products",
  "creative-media",
  "architecture-fabrication",
];

export function isProjectCategory(
  value: string | null,
): value is ProjectCategory {
  return projectCategories.includes(value as ProjectCategory);
}
