export interface Option {
  id: number;
  value: string;
  rarity: number;
}

export interface Category {
  category: string;
  options: Option[];
}

export interface ProjectData {
  project_type: string;
  constraints: Category[];
}
// Our selection state type: { "Genre & Setting-1": true, "Core Theme-5": true }
export type SelectedState = Record<string, boolean>;