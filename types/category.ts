import { GeneratorLanguage, GeneratorTag } from "@/constants/generator-metadata";
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
  language?: GeneratorLanguage | null;
  tags?: GeneratorTag[] | null;
  is_public: boolean;
  owner_id: string;
  source: Source;
  favorited_counter?: number;
}

export interface CategorySectionData {
  title: string;
  data: Category[];
  selected: string[];
}
