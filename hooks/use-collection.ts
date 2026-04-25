import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type FilterValue = string | number | boolean;

interface UseCollectionOptions {
  filterColumn?: string;
  filterValue?: FilterValue;
  attachOwnerId?: boolean;
  enforceOwnerScope?: boolean;
}

export function useCollection<T extends { id: string | number }>(
  tableName: string,
  options?: UseCollectionOptions,
) {
  const { session } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    filterColumn,
    filterValue,
    attachOwnerId = true,
    enforceOwnerScope = true,
  } = options ?? {};

  const fetchCollection = useCallback(
    async (overrideOptions?: UseCollectionOptions) => {
      const activeFilterColumn =
        overrideOptions?.filterColumn ?? filterColumn;
      const activeFilterValue =
        overrideOptions && "filterValue" in overrideOptions
          ? overrideOptions.filterValue
          : filterValue;

      try {
        setLoading(true);
        let query = supabase.from(tableName).select("*");

        if (activeFilterColumn && activeFilterValue !== undefined) {
          query = query.eq(activeFilterColumn, activeFilterValue);
        }

        const { data: result, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const normalizedData = (result || []) as T[];
        setData(normalizedData);
        return normalizedData;
      } catch (error) {
        console.error(error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [filterColumn, filterValue, tableName],
  );

  const addRecords = async (newRecords: Partial<T>[]) => {
    try {
      setLoading(true);
      const payload = newRecords.map((record) =>
        attachOwnerId ? { ...record, owner_id: session?.user.id } : record,
      );
      const { data: inserted, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select();

      if (error) throw error;

      const normalizedInserted = (inserted || []) as T[];
      setData((prev) => [...normalizedInserted, ...prev]);
      return normalizedInserted;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (newRecord: Partial<T>) => {
    const [inserted] = await addRecords([newRecord]);
    return inserted ?? null;
  };

  const deleteRecords = async (ids: (string | number)[]) => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).delete().in("id", ids);

      if (enforceOwnerScope) {
        query = query.eq("owner_id", session?.user.id);
      }

      const { error } = await query;

      if (error) throw error;

      setData((prev) => prev.filter((item) => !ids.includes(item.id)));

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string | number) => {
    return deleteRecords([id]);
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

  const updateRecords = async (
    updates: (Partial<T> & { id: string | number })[],
  ) => {
    try {
      setLoading(true);
      const { data: updated, error } = await supabase
        .from(tableName)
        .upsert(updates)
        .select();

      if (error) throw error;

      const normalizedUpdated = (updated || []) as T[];
      setData((prev) => {
        const updatedMap = new Map(
          normalizedUpdated.map((item) => [item.id, item]),
        );

        const merged = prev.map((item) => updatedMap.get(item.id) ?? item);
        const newItems = normalizedUpdated.filter(
          (item) => !prev.some((existing) => existing.id === item.id),
        );

        return [...newItems, ...merged];
      });

      return normalizedUpdated;
    } catch (error) {
      console.error("Bulk update error:", error);
      return [];
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
    fetchCollection,
    addRecord,
    addRecords,
    deleteRecord,
    deleteRecords,
    updateRecord,
    updateRecords,
    refresh: fetchCollection,
  };
}
