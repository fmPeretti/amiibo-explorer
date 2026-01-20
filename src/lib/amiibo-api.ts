// Use Next.js API proxy to avoid CORS issues
const BASE_URL = "/api/amiibo";

interface AmiiboFilters {
  name?: string;
  id?: string;
  type?: string;
  head?: string;
  tail?: string;
  gameseries?: string;
  amiiboSeries?: string;
  character?: string;
  showgames?: boolean;
  showusage?: boolean;
}

interface KeyNameFilter {
  key?: string;
  name?: string;
}

async function get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(BASE_URL, window.location.origin);
  url.searchParams.append('path', endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Amiibo endpoints
export async function getAmiibos(filters?: AmiiboFilters) {
  const params: Record<string, string> = {};
  if (filters) {
    if (filters.name) params.name = filters.name;
    if (filters.id) params.id = filters.id;
    if (filters.type) params.type = filters.type;
    if (filters.head) params.head = filters.head;
    if (filters.tail) params.tail = filters.tail;
    if (filters.gameseries) params.gameseries = filters.gameseries;
    if (filters.amiiboSeries) params.amiiboSeries = filters.amiiboSeries;
    if (filters.character) params.character = filters.character;
    if (filters.showgames) params.showgames = "";
    if (filters.showusage) params.showusage = "";
  }
  return get("amiibo", Object.keys(params).length > 0 ? params : undefined);
}

export async function getAmiiboById(id: string) {
  return getAmiibos({ id });
}

export async function getAmiiboByName(name: string) {
  return getAmiibos({ name });
}

export async function getAmiiboWithGames(head: string, tail: string) {
  return getAmiibos({ head, tail, showusage: true });
}

// Type endpoints
export async function getTypes(filters?: KeyNameFilter) {
  const params: Record<string, string> = {};
  if (filters?.key) params.key = filters.key;
  if (filters?.name) params.name = filters.name;
  return get("type", Object.keys(params).length > 0 ? params : undefined);
}

// Game series endpoints
export async function getGameSeries(filters?: KeyNameFilter) {
  const params: Record<string, string> = {};
  if (filters?.key) params.key = filters.key;
  if (filters?.name) params.name = filters.name;
  return get("gameseries", Object.keys(params).length > 0 ? params : undefined);
}

// Amiibo series endpoints
export async function getAmiiboSeries(filters?: KeyNameFilter) {
  const params: Record<string, string> = {};
  if (filters?.key) params.key = filters.key;
  if (filters?.name) params.name = filters.name;
  return get("amiiboseries", Object.keys(params).length > 0 ? params : undefined);
}

// Character endpoints
export async function getCharacters(filters?: KeyNameFilter) {
  const params: Record<string, string> = {};
  if (filters?.key) params.key = filters.key;
  if (filters?.name) params.name = filters.name;
  return get("character", Object.keys(params).length > 0 ? params : undefined);
}

// Last updated endpoint
export async function getLastUpdated() {
  return get("lastupdated");
}

// Get one amiibo from a game series (for getting series representative image)
export async function getAmiiboByGameSeries(gameSeries: string) {
  return getAmiibos({ gameseries: gameSeries });
}
