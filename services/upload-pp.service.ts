import { supabase } from "@/lib/supabase";

/**
 * Uploads an image from a local URI to Supabase Storage
 * * @param uri - The local URI from ImagePicker
 * @param folder - The bucket name (e.g., 'avatars')
 * @param userId - The user's ID to create a unique file path
 * @returns The public URL of the uploaded image
 */
export const uploadProfilePicture = async (uri: string, userId: string) => {
  try {
    // 1. Create a file extension from the URI
    const ext = uri.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;
    const filePath = fileName;

    // 2. Convert URI to Blob using XMLHttpRequest
    // This is more reliable in React Native than fetch() for local files
    const response = await fetch(uri);
    const blob = await response.blob();

    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("avatars") // Ensure this bucket exists and is public
      .upload(filePath, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) throw error;

    // 4. Get the Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
