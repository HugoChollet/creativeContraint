import { Option, SubCategory } from "@/types/constraints";

export interface CategoryJSON {
  name: string;
  disabled?: boolean;
  label?: string;
  options?: Option[];
  sub_categories?: SubCategory[];
  tabs?: string[];
  tabs_labels?: string[];
  description?: string;
  language?: string | null;
  tags?: string[] | null;
}

export interface ProjectJSON {
  project_type: string;
  project_label?: string;
  id: string;
  description?: string;
  language?: string | null;
  supported_files?: string | null;
  tags?: string[] | null;
  categories: CategoryJSON[];
}
