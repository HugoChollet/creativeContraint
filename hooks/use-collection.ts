import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type PrimitiveFilterValue = string | number | boolean;
type FilterValue = PrimitiveFilterValue | readonly PrimitiveFilterValue[];
type FilterOperator = "eq" | "overlaps" | "in";

interface UseCollectionOptions {
  select?: string;
  filterColumn?: string;
  filterValue?: FilterValue;
  filterOperator?: FilterOperator;
  orderBy?: string;
  ascending?: boolean;
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
    select = "*",
    filterColumn,
    filterValue,
    filterOperator = "eq",
    orderBy = "created_at",
    ascending = false,
    attachOwnerId = true,
    enforceOwnerScope = true,
  } = options ?? {};

  const fetchCollection = useCallback(
    async (overrideOptions?: UseCollectionOptions) => {
      const activeSelect = overrideOptions?.select ?? select;
      const activeFilterColumn =
        overrideOptions?.filterColumn ?? filterColumn;
      const activeFilterValue =
        overrideOptions && "filterValue" in overrideOptions
          ? overrideOptions.filterValue
          : filterValue;
      const activeFilterOperator =
        overrideOptions?.filterOperator ?? filterOperator;
      const activeOrderBy =
        overrideOptions && "orderBy" in overrideOptions
          ? overrideOptions.orderBy
          : orderBy;
      const activeAscending =
        overrideOptions && "ascending" in overrideOptions
          ? overrideOptions.ascending ?? false
          : ascending;

      try {
        setLoading(true);
        let query = supabase.from(tableName).select(activeSelect);

        if (activeFilterColumn && activeFilterValue !== undefined) {
          if (activeFilterOperator === "in" && Array.isArray(activeFilterValue)) {
            if (activeFilterValue.length === 0) {
              setData([]);
              return [];
            }

            query = query.in(activeFilterColumn, activeFilterValue);
          } else if (
            activeFilterOperator === "overlaps" &&
            Array.isArray(activeFilterValue)
          ) {
            query = query.overlaps(activeFilterColumn, activeFilterValue);
          } else {
            query = query.eq(
              activeFilterColumn,
              activeFilterValue as string | number | boolean,
            );
          }
        }

        if (activeOrderBy) {
          query = query.order(activeOrderBy, {
            ascending: activeAscending,
          });
        }

        const { data: result, error } = await query;

        if (error) throw error;

        const normalizedData = (result || []) as unknown as T[];
        setData(normalizedData);
        return normalizedData;
      } catch (error) {
        console.error(error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [
      ascending,
      filterColumn,
      filterOperator,
      filterValue,
      orderBy,
      select,
      tableName,
    ],
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
        .select(select);

      if (error) throw error;

      const normalizedInserted = (inserted || []) as unknown as T[];
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
        .select(select)
        .single();

      if (error) throw error;

      const normalizedUpdated = updated as unknown as T;

      setData((prev) =>
        prev.map((item) => ((item as any).id === id ? normalizedUpdated : item)),
      );
      return normalizedUpdated;
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
        .select(select);

      if (error) throw error;

      const normalizedUpdated = (updated || []) as unknown as T[];
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
