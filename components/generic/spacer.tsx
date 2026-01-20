import { View } from "react-native";

export function Spacer({ height, width }: { height?: number; width?: number }) {
  return <View style={{ height, width }} />;
}
