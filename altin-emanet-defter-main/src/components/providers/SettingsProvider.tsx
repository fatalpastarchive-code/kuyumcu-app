import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  largeTextMode: boolean;
  setLargeTextMode: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [largeTextMode, setLargeTextModeState] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedLargeTextMode = localStorage.getItem("largeTextMode");
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (savedLargeTextMode) {
      setLargeTextModeState(savedLargeTextMode === "true");
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply large text mode to document
  useEffect(() => {
    const root = document.documentElement;
    if (largeTextMode) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }
    localStorage.setItem("largeTextMode", largeTextMode.toString());
  }, [largeTextMode]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLargeTextMode = (enabled: boolean) => {
    setLargeTextModeState(enabled);
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, largeTextMode, setLargeTextMode }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
