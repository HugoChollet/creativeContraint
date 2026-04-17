export interface Option {
  id: number;
  value: string;
  rarity: number;
  description?: string;
}

export interface SubCategory {
  name: string;
  label?: string;
  options: Option[];
  description?: string;
}

export type SelectedState = {
  activeCategories: Record<string, boolean>; // e.g., { "Core Theme": true }
  selectedOptions: Record<string, boolean>; // e.g., { "Core Theme-5": true }
};

export type GeneratedConstraints = Record<string, Option>;
export type IdSetConstraint = Record<string, number>;

export type ConstraintSetIds = {
  project_type: string;
  constraints: IdSetConstraint;
};

export type SavedConstraintSet = {
  id: number | string;
  project_type: string;
  difficulty: number;
  constraints: IdSetConstraint;
};
