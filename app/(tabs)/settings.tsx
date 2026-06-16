import { Spacer } from "@/components/generic/spacer";
import Account from "@/components/specific/account";
import { AppPreferences } from "@/components/specific/app-preferences";
import Auth from "@/components/specific/auth";
import { TutorialSettingsButton } from "@/components/specific/tutorial/tutorial-settings-button";
import { useAuth } from "@/contexts/auth-context";
import { useStyles } from "@/hooks/use-styles";
import { ScrollView, View } from "react-native";

export default function SettingsScreen() {
  const { globalStyles } = useStyles();
  const { session } = useAuth();

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView style={globalStyles.backgroundColor}>
        <View style={globalStyles.shadeContainer}>
          <AppPreferences />
        </View>
        <Spacer height={24} />
        <View>
          {session && session.user ? <Account session={session} /> : <Auth />}
        </View>
        <Spacer height={24} />
        <TutorialSettingsButton />
        <Spacer height={24} />
      </ScrollView>
    </View>
  );
}
