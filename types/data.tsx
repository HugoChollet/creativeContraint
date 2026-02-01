import { Option } from "@/types/constraints";

export type ChosenOption = Record<string, Option>;

export type SavedProjectConstraints = {
  id: number;
  owner_id: string;
  project_type: string;
  constraints: Record<string, { id: number }>;
  difficulty: number;
};
