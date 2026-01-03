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

export type SelectedState = {
  activeCategories: Record<string, boolean>; // e.g., { "Core Theme": true }
  selectedOptions: Record<string, boolean>;  // e.g., { "Core Theme-5": true }
};