import {
  getDefaultProjectLanguage,
  normalizeProjectTags,
  ProjectLanguage,
  ProjectTag,
} from "@/constants/project-metadata";
import { Category } from "@/types/category";
import i18n from "@/i18n";
import React, { createContext, ReactNode, useContext, useState } from "react";

export function getRandomColor() {
  const randomChannel = () => Math.floor(Math.random() * 256);

  return `#${[randomChannel(), randomChannel(), randomChannel()]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

interface ProjectDraftContextType {
  id: string;
  setId: (id: string) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  language: ProjectLanguage;
  setLanguage: (language: ProjectLanguage) => void;
  tags: ProjectTag[];
  setTags: (tags: ProjectTag[]) => void;
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
  const [id, setId] = useState("");
  const [name, setName] = useState("New");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<ProjectLanguage>(
    getDefaultProjectLanguage(i18n.language),
  );
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [projectColor, setProjectColor] = useState(getRandomColor);
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
    setId("");
    setName("New");
    setDescription("");
    setLanguage(getDefaultProjectLanguage(i18n.language));
    setTags([]);
    setProjectColor(getRandomColor());
    setSelectedCategories([]);
  };

  return (
    <ProjectDraftContext.Provider
      value={{
        id,
        setId,
        name,
        setName,
        description,
        setDescription,
        language,
        setLanguage,
        tags,
        setTags: (nextTags) => setTags(normalizeProjectTags(nextTags)),
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
