import {
  loadTutorialCompleted,
  saveTutorialCompleted,
} from "@/lib/tutorial";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface TutorialContextType {
  hasCompletedTutorial: boolean;
  isTutorialVisible: boolean;
  completeTutorial: () => Promise<void>;
  dismissTutorial: () => void;
  replayTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export const useTutorial = () => {
  const context = useContext(TutorialContext);

  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }

  return context;
};

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadTutorialCompleted().then((hasCompleted) => {
      if (!isMounted) {
        return;
      }

      setHasCompletedTutorial(hasCompleted);
      setIsTutorialVisible(!hasCompleted);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const completeTutorial = useCallback(async () => {
    setHasCompletedTutorial(true);
    setIsTutorialVisible(false);
    await saveTutorialCompleted();
  }, []);

  const dismissTutorial = useCallback(() => {
    setIsTutorialVisible(false);
  }, []);

  const replayTutorial = useCallback(() => {
    setIsTutorialVisible(true);
  }, []);

  const value = useMemo(
    () => ({
      hasCompletedTutorial,
      isTutorialVisible,
      completeTutorial,
      dismissTutorial,
      replayTutorial,
    }),
    [
      completeTutorial,
      dismissTutorial,
      hasCompletedTutorial,
      isTutorialVisible,
      replayTutorial,
    ],
  );

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}
