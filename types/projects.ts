import {
  ProjectLanguage,
  ProjectSupportedFileType,
  ProjectTag,
} from "@/constants/project-metadata";
import { Category } from "./category";

export enum Source {
  Official = "official",
  Community = "community",
  User = "user",
}

export interface Project {
  id: string;
  name: string;
  description: string;
  source: Source;
  categories: Category[];
  language?: ProjectLanguage | null;
  supported_files?: ProjectSupportedFileType | null;
  tags?: ProjectTag[] | null;
  is_public: boolean;
  owner_id: string;
  color?: string;
  favorited_counter?: number;
  created_at?: string;
}

export interface ProjectSectionData {
  title: string;
  data: Project[];
  selected: string[];
}

export interface UserProjectSelection {
  id: string;
  owner_id: string;
  project_id: string;
  selected_category_ids: string[];
  created_at: string;
}

export interface ProjectCategoryRelation {
  id: string;
  project_id: string;
  category_id: string;
  owner_id: string;
}

export interface ProjectCategoryRelationResult {
  categories: Category | null;
}

export interface ProjectRelation {
  id: string;
  name: string;
  description: string;
  source: Source;
  language?: ProjectLanguage | null;
  supported_files?: ProjectSupportedFileType | null;
  tags?: ProjectTag[] | null;
  is_public: boolean;
  owner_id: string;
  color?: string;
  created_at: string;
  favorited_counter: number;
  project_category_relations: ProjectCategoryRelationResult[];
}
