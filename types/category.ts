import { ProjectLanguage, ProjectTag } from "@/constants/project-metadata";
import { Option } from "@/types/constraints";

export enum Source {
  Official = "official",
  Community = "community",
  User = "user",
}

export interface Category {
  id: string;
  name: string;
  description: string;
  options: Option[];
  language?: ProjectLanguage | null;
  tags?: ProjectTag[] | null;
  is_public: boolean;
  owner_id: string;
  source: Source;
}

export interface CategorySectionData {
  title: string;
  data: Category[];
  selected: string[];
}
