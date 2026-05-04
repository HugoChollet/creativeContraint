import { useStyles } from "@/hooks/use-styles";
import { Category, Source as CategorySource } from "@/types/category";
import { Option } from "@/types/constraints";
import { ProjectJSON } from "@/types/json-objects";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";

export const IMPORTED_CATEGORY_PREFIX = "imported-json:";

export const isImportedDraftCategory = (category: Category) =>
  category.id.startsWith(IMPORTED_CATEGORY_PREFIX);

export const getImportedCategoryDbName = (
  projectName: string,
  categoryName: string,
) => `${projectName.trim()}-${categoryName.trim()}`;

interface ImportedProjectDraft {
  name?: string;
  description: string;
  categories: Category[];
}

interface ProjectJsonImporterProps {
  projectColor: string;
  projectTypeId: string;
  fallbackProjectName: string;
  onImported: (draft: ImportedProjectDraft) => void;
  onImportingChange?: (isImporting: boolean) => void;
}

const normalizeOptions = (options?: Option[]) =>
  (options ?? [])
    .map((option, index) => ({
      id: typeof option.id === "number" ? option.id : index + 1,
      value:
        typeof option.value === "string"
          ? option.value.trim()
          : String(option.value ?? ""),
      rarity: typeof option.rarity === "number" ? option.rarity : 1,
      description:
        typeof option.description === "string"
          ? option.description.trim()
          : undefined,
    }))
    .filter((option) => option.value.length > 0);

const normalizeImportedProject = (rawFileContent: string): ProjectJSON => {
  const parsed = JSON.parse(rawFileContent) as Partial<ProjectJSON>;

  if (!parsed || !Array.isArray(parsed.categories)) {
    throw new Error("Invalid project JSON");
  }

  return {
    project_type:
      typeof parsed.project_type === "string" ? parsed.project_type : "",
    project_label:
      typeof parsed.project_label === "string"
        ? parsed.project_label
        : undefined,
    id: typeof parsed.id === "string" ? parsed.id : "",
    description:
      typeof parsed.description === "string" ? parsed.description : undefined,
    categories: parsed.categories,
  };
};

const decodeBase64ToUtf8 = (base64: string) => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

const readImportedFileContent = async (
  asset: DocumentPicker.DocumentPickerAsset,
) => {
  if (Platform.OS === "web") {
    if (asset.file) {
      return asset.file.text();
    }

    if (asset.base64) {
      return decodeBase64ToUtf8(asset.base64);
    }

    throw new Error("No readable content returned by document picker");
  }

  return FileSystem.readAsStringAsync(asset.uri);
};

const buildImportedDraftCategories = (
  importedProject: ProjectJSON,
  projectTypeId: string,
) => {
  const normalizedCategories = importedProject.categories.flatMap((category) => {
    const categoryName = (category.label ?? category.name ?? "").trim();
    const categoryDescription = category.description?.trim() ?? "";
    const categoryOptions = normalizeOptions(category.options);

    if (categoryName.length > 0 && categoryOptions.length > 0) {
      return [
        {
          name: categoryName,
          description: categoryDescription,
          options: categoryOptions,
        },
      ];
    }

    return (category.sub_categories ?? []).flatMap((subCategory) => {
      const subCategoryName = (
        subCategory.label ??
        subCategory.name ??
        ""
      ).trim();
      const subCategoryOptions = normalizeOptions(subCategory.options);

      if (subCategoryName.length === 0 || subCategoryOptions.length === 0) {
        return [];
      }

      return [
        {
          name: [categoryName, subCategoryName].filter(Boolean).join(" - "),
          description: subCategory.description?.trim() ?? categoryDescription,
          options: subCategoryOptions,
        },
      ];
    });
  });

  return normalizedCategories.map((category, index) => ({
    id: `${IMPORTED_CATEGORY_PREFIX}${index}-${category.name}`,
    name: category.name,
    description: category.description,
    options: category.options,
    project_type_id: projectTypeId,
    is_public: false,
    owner_id: "",
    source: CategorySource.User,
  }));
};

export default function ProjectJsonImporter({
  projectColor,
  projectTypeId,
  fallbackProjectName,
  onImported,
  onImportingChange,
}: ProjectJsonImporterProps) {
  const { globalStyles } = useStyles();
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    fileName: string;
    count: number;
  } | null>(null);

  const setImporting = (value: boolean) => {
    setIsImporting(value);
    onImportingChange?.(value);
  };

  const handleImport = async () => {
    if (isImporting) return;

    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/json", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const selectedAsset = result.assets[0];
      const rawFileContent = await readImportedFileContent(selectedAsset);
      const importedProject = normalizeImportedProject(rawFileContent);
      const importedCategories = buildImportedDraftCategories(
        importedProject,
        projectTypeId,
      );

      if (importedCategories.length === 0) {
        throw new Error("No importable categories found");
      }

      onImported({
        name:
          importedProject.project_label?.trim() ||
          importedProject.project_type?.trim() ||
          fallbackProjectName,
        description: importedProject.description?.trim() ?? "",
        categories: importedCategories,
      });

      setImportSummary({
        fileName: selectedAsset.name,
        count: importedCategories.length,
      });
    } catch (error) {
      console.error("Failed to import project JSON", error);
      Alert.alert(
        t("screen:project_form.import_error_title"),
        t("screen:project_form.import_error_invalid"),
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Text style={globalStyles.label}>
        {t("screen:project_form.import_button")}
      </Text>
      <TouchableOpacity
        style={[
          globalStyles.mediaIntegrationContainer,
          {
            borderColor: projectColor,
            opacity: isImporting ? 0.7 : 1,
            marginBottom: 8,
          },
        ]}
        onPress={handleImport}
        disabled={isImporting}
      >
        {isImporting ? (
          <ActivityIndicator color={projectColor} />
        ) : (
          <Ionicons
            name="document-attach-outline"
            size={32}
            color={projectColor}
          />
        )}
        <Text
          style={[
            globalStyles.text,
            { color: projectColor, marginTop: 8 },
          ]}
        >
          {t("screen:project_form.import_button")}
        </Text>
        {importSummary && (
          <Text style={globalStyles.discreetText}>
            {t("screen:project_form.import_helper", importSummary)}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
}
