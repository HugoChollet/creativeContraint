import {
  GeneratorLanguage,
  GeneratorSupportedFileType,
  GeneratorTag,
} from "@/constants/generator-metadata";
import { GeneratorRelation } from "./generators";

export interface Option {
  id: number;
  value: string;
  difficulty: number;
  description?: string;
}

export interface SubCategory {
  name: string;
  label?: string;
  options: Option[];
  description?: string;
}

export type SelectedState = {
  activeCategories: Record<string, boolean>;
  selectedOptions: Record<string, boolean>;
};

export type GeneratedConstraints = Record<string, Option>;
export type IdSetConstraint = Record<string, number>;

export type GeneratedConstraintSet = {
  id: string;
  name: string;
  projectId?: string | null;
  projectLabel: string;
  language?: GeneratorLanguage | null;
  supportedFiles?: GeneratorSupportedFileType | null;
  tags?: GeneratorTag[] | null;
  color?: string | null;
  generatedAt: string;
  constraints: GeneratedConstraints;
  constraintIds: IdSetConstraint;
  savedConstraintSetId?: number | string | null;
};

export type SavedConstraintSet = {
  id: number | string;
  name: string;
  project_id?: string | null;
  project_label: string;
  language?: GeneratorLanguage | null;
  supported_files?: GeneratorSupportedFileType | null;
  tags?: GeneratorTag[] | null;
  color?: string | null;
  difficulty: number;
  constraints: IdSetConstraint;
  created_at?: string;
  owner_id?: string;
  is_public?: boolean;
  project?: GeneratorRelation | null;
};
