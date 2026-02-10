import { useStyles } from "@/hooks/use-styles";
import React from "react";
import { View } from "react-native";
import { BookMediaPicker } from "./book-picker";
import { ImageMediaPicker } from "./image-picker";
import { MusicMediaPicker } from "./music-picker";
import { YoutubeLinkPicker } from "./youtube-picker";

export type MediaPickerResult = {
  type: "image" | "audio" | "youtube" | "book_text" | "book_file" | null;
  value: any;
  isValid: boolean;
};

interface MediaPickerProps {
  projectLabel: string;
  projectColor: string;
  onChange: (result: MediaPickerResult) => void;
}

export const MediaPicker = ({
  projectLabel,
  projectColor,
  onChange,
}: MediaPickerProps) => {
  const { colors } = useStyles();

  const handleImage = (uri: string | null) => {
    onChange({ type: "image", value: uri, isValid: !!uri });
  };

  const handleMusic = (file: any) => {
    onChange({ type: "audio", value: file, isValid: !!file });
  };

  const handleYoutube = (url: string, valid: boolean) => {
    onChange({ type: "youtube", value: url, isValid: valid && url !== "" });
  };

  const handleBook = (data: { type: "text" | "file"; value: any }) => {
    const isValid =
      data.type === "text" ? data.value.length > 10 : !!data.value;
    onChange({
      type: data.type === "text" ? "book_text" : "book_file",
      value: data.value,
      isValid,
    });
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {["Photography", "Cooking", "Board Game"].includes(projectLabel) && (
        <ImageMediaPicker
          projectColor={projectColor}
          onImageSelected={handleImage}
        />
      )}

      {projectLabel === "Music" && (
        <MusicMediaPicker
          projectColor={projectColor}
          onFileSelected={handleMusic}
        />
      )}

      {(projectLabel === "Video Fiction" ||
        projectLabel === "Internet Video") && (
        <YoutubeLinkPicker
          projectColor={projectColor}
          onUrlChange={handleYoutube}
        />
      )}

      {projectLabel === "Book" && (
        <BookMediaPicker
          projectColor={projectColor}
          onContentChange={handleBook}
        />
      )}
    </View>
  );
};
