import {
  getDefaultGeneratorLanguage,
  getDefaultGeneratorSupportedFileType,
  getDefaultGeneratorTags,
  normalizeGeneratorTags,
  GeneratorLanguage,
  GeneratorSupportedFileType,
  GeneratorTag,
} from "@/constants/generator-metadata";
import { getHomeGeneratorColorFromTags } from "@/constants/home-generators";
import { Category } from "@/types/category";
import i18n from "@/i18n";
import React, { createContext, ReactNode, useContext, useState } from "react";

const getGeneratorColorFromTags = (values?: readonly string[] | null) =>
  getHomeGeneratorColorFromTags(values);

interface GeneratorDraftContextType {
  id: string;
  setId: (id: string) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  language: GeneratorLanguage;
  setLanguage: (language: GeneratorLanguage) => void;
  supportedFileType: GeneratorSupportedFileType;
  setSupportedFileType: (supportedFileType: GeneratorSupportedFileType) => void;
  tags: GeneratorTag[];
  setTags: (tags: GeneratorTag[]) => void;
  generatorColor: string;
  setGeneratorColor: (color: string) => void;
  selectedCategories: Category[];
  setSelectedCategories: (categories: Category[]) => void;
  toggleSelectedCategory: (category: Category) => void;
  resetGeneratorDraft: () => void;
}

const GeneratorDraftContext = createContext<GeneratorDraftContextType | undefined>(
  undefined,
);

export function GeneratorDraftProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState("");
  const [name, setName] = useState("New");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<GeneratorLanguage>(
    getDefaultGeneratorLanguage(i18n.language),
  );
  const [supportedFileType, setSupportedFileType] =
    useState<GeneratorSupportedFileType>(getDefaultGeneratorSupportedFileType());
  const [tags, setTags] = useState<GeneratorTag[]>(getDefaultGeneratorTags());
  const [generatorColor, setGeneratorColor] = useState(() =>
    getGeneratorColorFromTags(getDefaultGeneratorTags()),
  );
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const applyGeneratorTags = (nextTags: readonly string[]) => {
    const normalizedTags = normalizeGeneratorTags(nextTags);

    setTags(normalizedTags);
    setGeneratorColor(getGeneratorColorFromTags(normalizedTags));
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

  const resetGeneratorDraft = () => {
    const defaultTags = getDefaultGeneratorTags();

    setId("");
    setName("New");
    setDescription("");
    setLanguage(getDefaultGeneratorLanguage(i18n.language));
    setSupportedFileType(getDefaultGeneratorSupportedFileType());
    setTags(defaultTags);
    setGeneratorColor(getGeneratorColorFromTags(defaultTags));
    setSelectedCategories([]);
  };

  return (
    <GeneratorDraftContext.Provider
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
        setTags: applyGeneratorTags,
        generatorColor,
        setGeneratorColor,
        selectedCategories,
        setSelectedCategories,
        toggleSelectedCategory,
        resetGeneratorDraft,
      }}
    >
      {children}
    </GeneratorDraftContext.Provider>
  );
}

export function useGeneratorDraft() {
  const context = useContext(GeneratorDraftContext);

  if (!context) {
    throw new Error(
      "useGeneratorDraft must be used within a GeneratorDraftProvider",
    );
  }

  return context;
}
