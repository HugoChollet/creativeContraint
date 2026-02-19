import { SavedConstraintSet } from "./constraints";

export type MediaType =
  | "image"
  | "audio"
  | "youtube"
  | "book_text"
  | "book_file";

export interface Publication {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string | null;
  project_type: string;
  media_url: string | null;
  content_text: string | null;
  media_type: MediaType;
  constraint_set_id: string | null;

  generated_constraints?: SavedConstraintSet | null;
}

// Type pour la création d'une publication (sans les champs auto-générés)
export type CreatePublicationPayload = Omit<Publication, "id" | "created_at">;
