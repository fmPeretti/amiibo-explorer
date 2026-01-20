// Template storage for saving and loading template configurations

import { AmiiboListItem } from "./types";

export interface TemplateConfig {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  templateType: "coin" | "card";
  pageSize: string;
  diameter: number;
  cardWidth: number;
  cardHeight: number;
  margin: number;
  spacing: number;
  // Per-series back design selections
  seriesBackDesigns: Record<string, string>;
  // Image adjustments keyed by item key or "back-{series}"
  imageAdjustments: Record<string, { zoom: number; offsetX: number; offsetY: number }>;
  // Store the actual items so template can be regenerated independently
  items: AmiiboListItem[];
  // Original list name for reference
  listName?: string;
}

const STORAGE_KEY = "amiibo-templates";

// Generate a unique ID
function generateId(): string {
  return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all saved templates
export function getTemplates(): TemplateConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load templates:", e);
    return [];
  }
}

// Save templates to storage
function saveTemplates(templates: TemplateConfig[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error("Failed to save templates:", e);
  }
}

// Get a single template by ID
export function getTemplate(id: string): TemplateConfig | null {
  const templates = getTemplates();
  return templates.find((t) => t.id === id) || null;
}

// Save a new template
export function saveTemplate(
  name: string,
  config: Omit<TemplateConfig, "id" | "name" | "createdAt" | "updatedAt">
): TemplateConfig {
  const templates = getTemplates();
  const now = new Date().toISOString();

  const newTemplate: TemplateConfig = {
    ...config,
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
  };

  templates.push(newTemplate);
  saveTemplates(templates);
  return newTemplate;
}

// Update an existing template
export function updateTemplate(
  id: string,
  config: Partial<Omit<TemplateConfig, "id" | "createdAt">>
): TemplateConfig | null {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === id);

  if (index === -1) return null;

  templates[index] = {
    ...templates[index],
    ...config,
    updatedAt: new Date().toISOString(),
  };

  saveTemplates(templates);
  return templates[index];
}

// Delete a template
export function deleteTemplate(id: string): boolean {
  const templates = getTemplates();
  const filtered = templates.filter((t) => t.id !== id);

  if (filtered.length === templates.length) return false;

  saveTemplates(filtered);
  return true;
}

// Export all templates to JSON
export function exportTemplates(): string {
  const templates = getTemplates();
  return JSON.stringify(templates, null, 2);
}

// Export a single template to JSON
export function exportTemplate(id: string): string | null {
  const template = getTemplate(id);
  if (!template) return null;
  return JSON.stringify(template, null, 2);
}

// Import templates from JSON (merges with existing, avoiding duplicates by ID)
export function importTemplates(jsonString: string): { imported: number; skipped: number } {
  try {
    const imported = JSON.parse(jsonString);
    const existingTemplates = getTemplates();
    const existingIds = new Set(existingTemplates.map((t) => t.id));

    let importedCount = 0;
    let skippedCount = 0;

    // Handle both single template and array of templates
    const templatesToImport: TemplateConfig[] = Array.isArray(imported) ? imported : [imported];

    for (const template of templatesToImport) {
      // Validate template structure
      if (!template.id || !template.name || !template.templateType) {
        skippedCount++;
        continue;
      }

      if (existingIds.has(template.id)) {
        // Generate new ID if duplicate
        template.id = generateId();
      }

      existingTemplates.push(template);
      existingIds.add(template.id);
      importedCount++;
    }

    saveTemplates(existingTemplates);
    return { imported: importedCount, skipped: skippedCount };
  } catch (error) {
    console.error("Failed to import templates:", error);
    return { imported: 0, skipped: 0 };
  }
}

// Rename a template
export function renameTemplate(id: string, newName: string): TemplateConfig | null {
  return updateTemplate(id, { name: newName });
}
