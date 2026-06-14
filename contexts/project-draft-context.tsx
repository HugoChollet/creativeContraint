import {
  getDefaultProjectLanguage,
  getDefaultProjectSupportedFileType,
  getDefaultProjectTags,
  normalizeProjectTags,
  ProjectLanguage,
  ProjectSupportedFileType,
  ProjectTag,
} from "@/constants/project-metadata";
import { getHomeProjectColorFromTags } from "@/constants/home-projects";
import { Category } from "@/types/category";
import i18n from "@/i18n";
import React, { createContext, ReactNode, useContext, useState } from "react";

const getProjectColorFromTags = (values?: readonly string[] | null) =>
  getHomeProjectColorFromTags(values);

interface ProjectDraftContextType {
  id: string;
  setId: (id: string) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  language: ProjectLanguage;
  setLanguage: (language: ProjectLanguage) => void;
  supportedFileType: ProjectSupportedFileType;
  setSupportedFileType: (supportedFileType: ProjectSupportedFileType) => void;
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
  const [supportedFileType, setSupportedFileType] =
    useState<ProjectSupportedFileType>(getDefaultProjectSupportedFileType());
  const [tags, setTags] = useState<ProjectTag[]>(getDefaultProjectTags());
  const [projectColor, setProjectColor] = useState(() =>
    getProjectColorFromTags(getDefaultProjectTags()),
  );
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const applyProjectTags = (nextTags: readonly string[]) => {
    const normalizedTags = normalizeProjectTags(nextTags);

    setTags(normalizedTags);
    setProjectColor(getProjectColorFromTags(normalizedTags));
  };

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
    const defaultTags = getDefaultProjectTags();

    setId("");
    setName("New");
    setDescription("");
    setLanguage(getDefaultProjectLanguage(i18n.language));
    setSupportedFileType(getDefaultProjectSupportedFileType());
    setTags(defaultTags);
    setProjectColor(getProjectColorFromTags(defaultTags));
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
        supportedFileType,
        setSupportedFileType,
        tags,
        setTags: applyProjectTags,
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
