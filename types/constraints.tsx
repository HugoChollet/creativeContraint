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

export interface Category {
  category: string;
  disabled?: boolean;
  label?: string;
  options?: Option[];
  sub_categories?: SubCategory[];
  tabs?: string[];
  tabs_labels?: string[];
  description?: string;
}

export interface ConstraintSetData {
  project_type: string;
  project_label?: string;
  constraints: Category[];
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
