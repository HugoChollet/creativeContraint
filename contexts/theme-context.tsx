// context/ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { AppThemeColors, Themes } from "../constants/theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
  colors: AppThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode; // This is the crucial part
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemTheme = useColorScheme() ?? "light";
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  const resolvedTheme = themeMode === "system" ? systemTheme : themeMode;
  const colors = Themes[resolvedTheme];

  return (
    <ThemeContext.Provider
      value={{ themeMode, setThemeMode, resolvedTheme, colors }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
