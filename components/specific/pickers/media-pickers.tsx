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
  projectLabel?: string;
  supportedFileType?: string | null;
  projectColor: string;
  onChange: (result: MediaPickerResult) => void;
}

export const MediaPicker = ({
  projectLabel,
  supportedFileType,
  projectColor,
  onChange,
}: MediaPickerProps) => {
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

  const pickerMode =
    supportedFileType === "png/jpg"
      ? "image"
      : supportedFileType === "mp3"
        ? "audio"
        : supportedFileType === "youtube link"
          ? "youtube"
          : supportedFileType === "plain text" ||
              supportedFileType === "docs/pdf"
            ? "book"
            : ["Photography", "Cooking", "Board Game"].includes(
                  projectLabel ?? "",
                )
              ? "image"
              : projectLabel === "Music"
                ? "audio"
                : projectLabel === "Video Fiction" ||
                    projectLabel === "Internet Video"
                  ? "youtube"
                  : projectLabel === "Book"
                    ? "book"
                    : null;

  return (
    <View style={{ marginBottom: 20 }}>
      {pickerMode === "image" && (
        <ImageMediaPicker
          projectColor={projectColor}
          onImageSelected={handleImage}
        />
      )}

      {pickerMode === "audio" && (
        <MusicMediaPicker
          projectColor={projectColor}
          onFileSelected={handleMusic}
        />
      )}

      {pickerMode === "youtube" && (
        <YoutubeLinkPicker
          projectColor={projectColor}
          onUrlChange={handleYoutube}
        />
      )}

      {pickerMode === "book" && (
        <BookMediaPicker
          projectColor={projectColor}
          onContentChange={handleBook}
        />
      )}
    </View>
  );
};
