import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type FilterValue = string | number | boolean;

interface UseCollectionOptions {
  filterColumn?: string;
  filterValue?: FilterValue;
}

export function useCollection<T extends { id: string | number }>(
  tableName: string,
  options?: UseCollectionOptions,
) {
  const { session } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const { filterColumn, filterValue } = options ?? {};

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).select("*");

      if (filterColumn && filterValue !== undefined) {
        query = query.eq(filterColumn, filterValue);
      }

      const { data: result, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, tableName]);

  const addRecord = async (newRecord: Partial<T>) => {
    try {
      setLoading(true);
      const { data: inserted, error } = await supabase
        .from(tableName)
        .insert([{ ...newRecord, owner_id: session?.user.id }])
        .select()
        .single();

      if (error) throw error;

      setData((prev) => [inserted, ...prev]);
      return inserted as T;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string | number) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id)
        .eq("owner_id", session?.user.id);

      if (error) throw error;

      setData((prev) => prev.filter((item) => item.id !== id));

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id: string | number, updates: Partial<T>) => {
    try {
      setLoading(true);
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setData((prev) =>
        prev.map((item) => ((item as any).id === id ? updated : item)),
      );
      return updated as T;
    } catch (error) {
      console.error("Update error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return {
    data,
    loading,
    addRecord,
    deleteRecord,
    updateRecord,
    refresh: fetchCollection,
  };
}
