import { useStyles } from "@/hooks/use-styles";
import { TextInput } from "react-native";

interface DescriptionProps {
  description: string;
  setDescription: (text: string) => void;
  isLoading?: boolean;
  generatorColor?: string;
  placeholder?: string;
  height?: number;
}

export default function Description({
  description,
  setDescription,
  isLoading,
  generatorColor = "#000000",
  placeholder,
  height = 120,
}: DescriptionProps) {
  const { globalStyles, colors } = useStyles();
  const generatorColorSoft = generatorColor.replace(/[\d.]+\)$/g, `0.2)`);

  return (
    <TextInput
      style={[
        globalStyles.input,
        {
          height: height,
          textAlignVertical: "top",
          paddingTop: 12,
          borderColor: generatorColorSoft,
        },
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      multiline
      numberOfLines={4}
      value={description}
      onChangeText={setDescription}
      editable={!isLoading}
    />
  );
}
