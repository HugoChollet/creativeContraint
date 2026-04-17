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
}

export interface ConstraintSetDataJSON {
  project_type: string;
  project_label?: string;
  categories: CategoryJSON[];
}
