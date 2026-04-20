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
  is_public: boolean;
  owner_id: string;
}

export interface ProjectSectionData {
  title: string;
  data: Project[];
  selected: string[];
}
