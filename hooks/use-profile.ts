import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useProfile<T>(tableName: string, initialData: T) {
  const { session } = useAuth(); // Get session automatically from Context
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T>(initialData);

  console.log(session);

  const fetchData = useCallback(async () => {
    if (!session?.user) return; // Silent return if not logged in

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

      const payload = {
        ...updates,
        id: session.user.id,
        updated_at: new Date(),
      };

      const { error } = await supabase.from(tableName).upsert(payload);
      if (error) throw error;

      // Update local state after successful DB update
      setData((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
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
        .eq("owner_id", session?.user.id); // Extra safety: ensure user owns it

      if (error) throw error;

      // Reset local state after deletion
      setData(initialData);
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Return it at the bottom

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    setData,
    deleteData,
    loading,
    updateData: (updates: Partial<T>) => updateData(updates),
  };
}
