// Community templates - pre-made templates fetched from public directory
// These are NOT stored in localStorage, they are fetched on demand

import { TemplateConfig } from "./template-storage";

// Community template extends TemplateConfig with additional metadata
export interface CommunityTemplate extends Omit<TemplateConfig, "id" | "createdAt" | "updatedAt"> {
  id: string; // filename without extension
  name: string;
  description?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

// Index entry structure
interface CommunityTemplateIndexEntry {
  id: string;
  name: string;
  description?: string;
  author?: string;
  templateType?: string;
  itemCount?: number;
}

const COMMUNITY_TEMPLATES_PATH = "/templates";

// Cache for loaded templates
let indexCache: CommunityTemplateIndexEntry[] | null = null;
let templateCache: Map<string, CommunityTemplate> = new Map();

// Fetch the index of available community templates
export async function getCommunityTemplateIndex(): Promise<CommunityTemplateIndexEntry[] | null> {
  if (indexCache) return indexCache;

  try {
    const response = await fetch(`${COMMUNITY_TEMPLATES_PATH}/index.json`);
    if (!response.ok) return null;

    indexCache = await response.json();
    return indexCache;
  } catch (error) {
    console.error("Failed to fetch community templates index:", error);
    return null;
  }
}

// Fetch a specific community template by ID
export async function getCommunityTemplate(id: string): Promise<CommunityTemplate | null> {
  // Check cache first
  if (templateCache.has(id)) {
    return templateCache.get(id)!;
  }

  try {
    const response = await fetch(`${COMMUNITY_TEMPLATES_PATH}/${id}.json`);
    if (!response.ok) return null;

    const template: CommunityTemplate = await response.json();
    templateCache.set(id, template);
    return template;
  } catch (error) {
    console.error(`Failed to fetch community template ${id}:`, error);
    return null;
  }
}

// Fetch all community templates
export async function getAllCommunityTemplates(): Promise<CommunityTemplate[]> {
  const index = await getCommunityTemplateIndex();
  if (!index || !Array.isArray(index)) return [];

  const templates: CommunityTemplate[] = [];

  for (const entry of index) {
    const template = await getCommunityTemplate(entry.id);
    if (template) {
      // Merge index metadata with template data
      templates.push({
        ...template,
        description: entry.description || template.description,
        author: entry.author || template.author,
      });
    }
  }

  return templates;
}

// Convert a community template to a regular TemplateConfig for use in TemplateGenerator
export function communityTemplateToConfig(template: CommunityTemplate): TemplateConfig {
  return {
    id: `community-${template.id}`,
    name: template.name,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    templateType: template.templateType,
    pageSize: template.pageSize,
    diameter: template.diameter,
    cardWidth: template.cardWidth,
    cardHeight: template.cardHeight,
    margin: template.margin,
    spacing: template.spacing,
    seriesBackDesigns: template.seriesBackDesigns,
    imageAdjustments: template.imageAdjustments,
    items: template.items,
    listName: template.listName,
  };
}

// Clear the cache (useful for forcing a refresh)
export function clearCommunityTemplateCache(): void {
  indexCache = null;
  templateCache.clear();
}
