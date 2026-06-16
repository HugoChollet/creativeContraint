import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeneratedConstraintSet } from "@/types/constraints";

const GENERATORS_HISTORY_STORAGE_PREFIX = "generators-history:v4";
export const GENERATORS_HISTORY_LIMIT = 24;

const getGeneratorsHistoryStorageKey = (generatorHistoryKey: string) =>
  `${GENERATORS_HISTORY_STORAGE_PREFIX}:${generatorHistoryKey}`;

export const loadGeneratorsHistory = async (
  generatorHistoryKey: string,
): Promise<GeneratedConstraintSet[]> => {
  try {
    const rawHistory = await AsyncStorage.getItem(
      getGeneratorsHistoryStorageKey(generatorHistoryKey),
    );

    if (!rawHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(rawHistory);

    return Array.isArray(parsedHistory)
      ? parsedHistory.slice(-GENERATORS_HISTORY_LIMIT)
      : [];
  } catch (error) {
    console.error("Failed to load generators history", error);
    return [];
  }
};

export const saveGeneratorsHistory = async (
  generatorHistoryKey: string,
  generationHistory: GeneratedConstraintSet[],
) => {
  try {
    await AsyncStorage.setItem(
      getGeneratorsHistoryStorageKey(generatorHistoryKey),
      JSON.stringify(generationHistory.slice(-GENERATORS_HISTORY_LIMIT)),
    );
  } catch (error) {
    console.error("Failed to save generators history", error);
  }
};
