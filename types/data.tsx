import { Option } from "@/types/constraints";

export type ChosenOption = Record<string, Option>;

export type SavedProjectConstraints = {
  id: number;
  owner_id: string; // Ensure this matches the DB column
  project_type: string;
  constraints: ChosenOption;
  difficulty: number;
};
