import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useProfile<T>(
  session: Session,
  tableName: string,
  initialData: T
) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T>(initialData);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const {
        data: result,
        error,
        status,
      } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && status !== 406) throw error;
      if (result) setData(result);
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [session, tableName]);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { loading, data, setData, updateData, refresh: fetchData };
}
