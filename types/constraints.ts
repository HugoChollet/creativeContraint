import {
  ProjectLanguage,
  ProjectSupportedFileType,
  ProjectTag,
} from "@/constants/project-metadata";
import { ProjectRelation } from "./projects";

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
  activeCategories: Record<string, boolean>;
  selectedOptions: Record<string, boolean>;
};

export type GeneratedConstraints = Record<string, Option>;
export type IdSetConstraint = Record<string, number>;

export type GeneratedConstraintSet = {
  id: string;
  projectId?: string | null;
  projectLabel: string;
  language?: ProjectLanguage | null;
  supportedFiles?: ProjectSupportedFileType | null;
  tags?: ProjectTag[] | null;
  color?: string | null;
  generatedAt: string;
  constraints: GeneratedConstraints;
  constraintIds: IdSetConstraint;
  savedConstraintSetId?: number | string | null;
};

export type SavedConstraintSet = {
  id: number | string;
  project_id?: string | null;
  project_label: string;
  language?: ProjectLanguage | null;
  supported_files?: ProjectSupportedFileType | null;
  tags?: ProjectTag[] | null;
  color?: string | null;
  difficulty: number;
  constraints: IdSetConstraint;
  created_at?: string;
  owner_id?: string;
  is_public?: boolean;
  project?: ProjectRelation | null;
};
