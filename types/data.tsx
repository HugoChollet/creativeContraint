import { Option } from '@/types/constraints';

export type ChosenOption = Record<string, Option>;

export type SavedProjectConstraints = {
  id: number;
  project_type: string;
  constraints: ChosenOption;
  difficulty: number;
  createdAt: Date;
};