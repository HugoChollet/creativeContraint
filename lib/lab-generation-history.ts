import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeneratedConstraintSet } from "@/types/constraints";

const LAB_GENERATION_HISTORY_STORAGE_PREFIX = "lab-generated-history:v1";
export const LAB_GENERATION_HISTORY_LIMIT = 24;

const getLabGenerationHistoryStorageKey = (projectHistoryKey: string) =>
  `${LAB_GENERATION_HISTORY_STORAGE_PREFIX}:${projectHistoryKey}`;

export const loadLabGenerationHistory = async (
  projectHistoryKey: string,
): Promise<GeneratedConstraintSet[]> => {
  try {
    const rawHistory = await AsyncStorage.getItem(
      getLabGenerationHistoryStorageKey(projectHistoryKey),
    );

    if (!rawHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(rawHistory);

    return Array.isArray(parsedHistory)
      ? parsedHistory.slice(-LAB_GENERATION_HISTORY_LIMIT)
      : [];
  } catch (error) {
    console.error("Failed to load lab generation history", error);
    return [];
  }
};

export const saveLabGenerationHistory = async (
  projectHistoryKey: string,
  generationHistory: GeneratedConstraintSet[],
) => {
  try {
    await AsyncStorage.setItem(
      getLabGenerationHistoryStorageKey(projectHistoryKey),
      JSON.stringify(generationHistory.slice(-LAB_GENERATION_HISTORY_LIMIT)),
    );
  } catch (error) {
    console.error("Failed to save lab generation history", error);
  }
};
