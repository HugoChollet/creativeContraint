import { Category } from "@/types/category";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface ProjectDraftContextType {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  projectColor: string;
  setProjectColor: (color: string) => void;
  selectedCategories: Category[];
  setSelectedCategories: (categories: Category[]) => void;
  toggleSelectedCategory: (category: Category) => void;
  resetProjectDraft: () => void;
}

const ProjectDraftContext = createContext<ProjectDraftContextType | undefined>(
  undefined,
);

export function ProjectDraftProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("New");
  const [description, setDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#ffff");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const toggleSelectedCategory = (category: Category) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.some((item) => item.id === category.id);

      if (isSelected) {
        return prev.filter((item) => item.id !== category.id);
      }

      return [...prev, category];
    });
  };

  const resetProjectDraft = () => {
    setName("New");
    setDescription("");
    setProjectColor("#ffff");
    setSelectedCategories([]);
  };

  return (
    <ProjectDraftContext.Provider
      value={{
        name,
        setName,
        description,
        setDescription,
        projectColor,
        setProjectColor,
        selectedCategories,
        setSelectedCategories,
        toggleSelectedCategory,
        resetProjectDraft,
      }}
    >
      {children}
    </ProjectDraftContext.Provider>
  );
}

export function useProjectDraft() {
  const context = useContext(ProjectDraftContext);

  if (!context) {
    throw new Error(
      "useProjectDraft must be used within a ProjectDraftProvider",
    );
  }

  return context;
}
