import { AmiiboList, AmiiboListItem, Amiibo } from "./types";

const LISTS_KEY = "amiibo-lists";

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all lists
export function getLists(): AmiiboList[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LISTS_KEY);
  return data ? JSON.parse(data) : [];
}

// Save all lists
function saveLists(lists: AmiiboList[]): void {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

// Create a new list
export function createList(name: string): AmiiboList {
  const lists = getLists();
  const newList: AmiiboList = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
  };
  lists.push(newList);
  saveLists(lists);
  return newList;
}

// Get a single list by ID
export function getList(id: string): AmiiboList | undefined {
  const lists = getLists();
  return lists.find((list) => list.id === id);
}

// Update list name
export function updateListName(id: string, name: string): AmiiboList | undefined {
  const lists = getLists();
  const list = lists.find((l) => l.id === id);
  if (list) {
    list.name = name;
    list.updatedAt = new Date().toISOString();
    saveLists(lists);
  }
  return list;
}

// Delete a list
export function deleteList(id: string): void {
  const lists = getLists();
  const filtered = lists.filter((list) => list.id !== id);
  saveLists(filtered);
}

// Convert Amiibo to AmiiboListItem
export function amiiboToListItem(amiibo: Amiibo): AmiiboListItem {
  return {
    head: amiibo.head,
    tail: amiibo.tail,
    name: amiibo.name,
    image: amiibo.image,
    character: amiibo.character,
    amiiboSeries: amiibo.amiiboSeries,
    gameSeries: amiibo.gameSeries,
    type: amiibo.type,
  };
}

// Add amiibo to a list
export function addAmiiboToList(listId: string, amiibo: Amiibo): AmiiboList | undefined {
  const lists = getLists();
  const list = lists.find((l) => l.id === listId);
  if (list) {
    // Check if already in list
    const exists = list.items.some(
      (item) => item.head === amiibo.head && item.tail === amiibo.tail
    );
    if (!exists) {
      list.items.push(amiiboToListItem(amiibo));
      list.updatedAt = new Date().toISOString();
      saveLists(lists);
    }
  }
  return list;
}

// Remove amiibo from a list
export function removeAmiiboFromList(
  listId: string,
  head: string,
  tail: string
): AmiiboList | undefined {
  const lists = getLists();
  const list = lists.find((l) => l.id === listId);
  if (list) {
    list.items = list.items.filter(
      (item) => !(item.head === head && item.tail === tail)
    );
    list.updatedAt = new Date().toISOString();
    saveLists(lists);
  }
  return list;
}

// Check if amiibo is in any list
export function isAmiiboInList(listId: string, head: string, tail: string): boolean {
  const list = getList(listId);
  if (!list) return false;
  return list.items.some((item) => item.head === head && item.tail === tail);
}

// Get the most recently updated list
export function getLatestList(): AmiiboList | undefined {
  const lists = getLists();
  if (lists.length === 0) return undefined;
  return lists.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

// Reorder items in a list
export function reorderListItems(
  listId: string,
  fromIndex: number,
  toIndex: number
): AmiiboList | undefined {
  const lists = getLists();
  const list = lists.find((l) => l.id === listId);
  if (list && fromIndex >= 0 && toIndex >= 0 && fromIndex < list.items.length && toIndex < list.items.length) {
    const [item] = list.items.splice(fromIndex, 1);
    list.items.splice(toIndex, 0, item);
    list.updatedAt = new Date().toISOString();
    saveLists(lists);
  }
  return list;
}

// Export all lists to JSON
export function exportLists(): string {
  const lists = getLists();
  return JSON.stringify(lists, null, 2);
}

// Export a single list to JSON
export function exportList(listId: string): string | null {
  const list = getList(listId);
  if (!list) return null;
  return JSON.stringify(list, null, 2);
}

// Import lists from JSON (merges with existing, avoiding duplicates by ID)
export function importLists(jsonString: string): { imported: number; skipped: number } {
  try {
    const imported = JSON.parse(jsonString);
    const existingLists = getLists();
    const existingIds = new Set(existingLists.map((l) => l.id));

    let importedCount = 0;
    let skippedCount = 0;

    // Handle both single list and array of lists
    const listsToImport: AmiiboList[] = Array.isArray(imported) ? imported : [imported];

    for (const list of listsToImport) {
      // Validate list structure
      if (!list.id || !list.name || !Array.isArray(list.items)) {
        skippedCount++;
        continue;
      }

      if (existingIds.has(list.id)) {
        // Generate new ID if duplicate
        list.id = generateId();
      }

      existingLists.push(list);
      existingIds.add(list.id);
      importedCount++;
    }

    saveLists(existingLists);
    return { imported: importedCount, skipped: skippedCount };
  } catch (error) {
    console.error("Failed to import lists:", error);
    return { imported: 0, skipped: 0 };
  }
}
