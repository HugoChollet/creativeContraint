import {
  GeneratorLanguage,
  GeneratorSupportedFileType,
  GeneratorTag,
} from "@/constants/generator-metadata";
import { Category } from "./category";

export enum Source {
  Official = "official",
  Community = "community",
  User = "user",
}

export interface Generator {
  id: string;
  name: string;
  description: string;
  source: Source;
  categories: Category[];
  language?: GeneratorLanguage | null;
  supported_files?: GeneratorSupportedFileType | null;
  tags?: GeneratorTag[] | null;
  is_public: boolean;
  owner_id: string;
  color?: string;
  favorited_counter?: number;
  created_at?: string;
}

export interface GeneratorSectionData {
  title: string;
  data: Generator[];
  selected: string[];
}

export interface UserGeneratorSelection {
  id: string;
  owner_id: string;
  project_id: string;
  selected_category_ids: string[];
  created_at: string;
}

export interface GeneratorCategoryRelation {
  id: string;
  project_id: string;
  category_id: string;
  owner_id: string;
}

export interface GeneratorCategoryRelationResult {
  categories: Category | null;
}

export interface GeneratorRelation {
  id: string;
  name: string;
  description: string;
  source: Source;
  language?: GeneratorLanguage | null;
  supported_files?: GeneratorSupportedFileType | null;
  tags?: GeneratorTag[] | null;
  is_public: boolean;
  owner_id: string;
  color?: string;
  created_at: string;
  favorited_counter: number;
  project_category_relations: GeneratorCategoryRelationResult[];
}
