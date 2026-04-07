import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useProfile<T>(tableName: string, initialData: T) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T>(initialData);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      if (result) setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, tableName]);

  const updateData = async (updates: Partial<T>) => {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let finalUpdates = { ...updates };

      const avatarUrl = (updates as any).avatar_url;

      const isLocalUri =
        avatarUrl &&
        (avatarUrl.startsWith("blob:") ||
          avatarUrl.startsWith("file://") ||
          avatarUrl.startsWith("content://"));

      if (isLocalUri) {
        const response = await fetch(avatarUrl);
        const blob = await response.blob();

        const fileExt =
          blob.type.split("/")[1] || avatarUrl.split(".").pop() || "jpg";
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, {
            contentType: blob.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        finalUpdates = { ...finalUpdates, avatar_url: publicUrl };
      }

      const payload = {
        ...finalUpdates,
        id: session.user.id,
        updated_at: new Date(),
      };

      const { error } = await supabase.from(tableName).upsert(payload);
      if (error) throw error;

      setData((prev) => ({ ...prev, ...finalUpdates }));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Update Error:", error.message);
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id: string | number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id)
        .eq("owner_id", session?.user.id);

      if (error) throw error;
      setData(initialData);
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    setData,
    deleteData,
    loading,
    updateData,
  };
}
