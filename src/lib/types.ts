export interface GameUsage {
  gameName: string;
  gameID: string[];
  amiiboUsage: {
    Usage: string;
    write: boolean;
  }[];
}

export interface Amiibo {
  amiiboSeries: string;
  character: string;
  gameSeries: string;
  head: string;
  image: string;
  name: string;
  release: {
    au: string | null;
    eu: string | null;
    jp: string | null;
    na: string | null;
  };
  tail: string;
  type: string;
  games3DS?: GameUsage[];
  gamesSwitch?: GameUsage[];
  gamesWiiU?: GameUsage[];
}

export interface AmiiboResponse {
  amiibo: Amiibo | Amiibo[];
}

export interface TypeItem {
  key: string;
  name: string;
}

export interface TypeResponse {
  amiibo: TypeItem[];
}

export interface GameSeriesItem {
  key: string;
  name: string;
}

export interface GameSeriesResponse {
  amiibo: GameSeriesItem[];
}

export interface AmiiboSeriesItem {
  key: string;
  name: string;
}

export interface AmiiboSeriesResponse {
  amiibo: AmiiboSeriesItem[];
}

// Amiibo Lists
export interface AmiiboListItem {
  head: string;
  tail: string;
  name: string;
  image: string;
  character: string;
  amiiboSeries: string;
  gameSeries: string;
  type: string;
}

export interface AmiiboList {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: AmiiboListItem[];
}
