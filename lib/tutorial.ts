import AsyncStorage from "@react-native-async-storage/async-storage";

const TUTORIAL_COMPLETED_STORAGE_KEY = "tutorial:completed:v1";

export const loadTutorialCompleted = async (): Promise<boolean> => {
  try {
    const storedValue = await AsyncStorage.getItem(
      TUTORIAL_COMPLETED_STORAGE_KEY,
    );

    return storedValue === "true";
  } catch (error) {
    console.error("Failed to load tutorial status", error);
    return false;
  }
};

export const saveTutorialCompleted = async () => {
  try {
    await AsyncStorage.setItem(TUTORIAL_COMPLETED_STORAGE_KEY, "true");
  } catch (error) {
    console.error("Failed to save tutorial status", error);
  }
};
