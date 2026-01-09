import { GeneratedConstraints } from "./constraints";


export type ProjectSaved = {
  id: number;
  project_type: string;
  constraints: GeneratedConstraints;
  difficulty: number;
  createdAt: Date;
};