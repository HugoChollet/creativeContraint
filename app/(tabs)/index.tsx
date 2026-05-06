import AuthenticatedHomeView from "@/components/specific/home/authenticated-home-view";
import GuestHomeView from "@/components/specific/home/guest-home-view";
import { useAuth } from "@/contexts/auth-context";
import { useStyles } from "@/hooks/use-styles";
import { ActivityIndicator, View } from "react-native";

export default function HomeScreen() {
  const { session, loading } = useAuth();
  const { globalStyles, colors } = useStyles();

  if (loading) {
    return (
      <View
        style={[globalStyles.screenContainer, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return session ? <AuthenticatedHomeView /> : <GuestHomeView />;
}
