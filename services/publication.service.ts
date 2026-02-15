import { MediaPickerResult } from "@/components/specific/pickers/media-pickers";
import { supabase } from "@/lib/supabase";

export const publicationService = {
  async uploadFile(
    userId: string,
    media: MediaPickerResult,
  ): Promise<string | null> {
    if (!media.value) return null;

    const fileExt =
      media.type === "image" ? "jpg" : media.type === "audio" ? "mp3" : "pdf";
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    try {
      const response = await fetch(media.value);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("creations")
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("creations").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  },

  async createPublication(payload: {
    userId: string;
    title: string;
    description: string;
    projectType: string;
    media: MediaPickerResult;
    constraintId: string;
  }) {
    let finalMediaUrl = null;
    let contentText = null;

    if (payload.media.type === "youtube") {
      finalMediaUrl = payload.media.value;
    } else if (payload.media.type === "book_text") {
      contentText = payload.media.value;
    } else {
      finalMediaUrl = await this.uploadFile(payload.userId, payload.media);
    }

    const { data, error } = await supabase.from("publications").insert({
      user_id: payload.userId,
      title: payload.title,
      description: payload.description,
      project_type: payload.projectType,
      media_url: finalMediaUrl,
      content_text: contentText,
      media_type: payload.media.type,
      constraint_set_id: payload.constraintId,
    });

    if (error) throw error;
    return { success: true, data };
  },
};
