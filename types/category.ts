import { Option } from "@/types/constraints";

enum Source {
  Official = "official",
  Community = "community",
  User = "user",
}

export interface Category {
  id: string;
  name: string;
  description: string;
  options: Option[];
  project_type_id: string;
  is_public: boolean;
  owner_id: string;
  source: Source;
}
