import { Spacer } from "@/components/generic/spacer";
import Account from "@/components/specific/account";
import Auth from "@/components/specific/auth";
import { TutorialSettingsButton } from "@/components/specific/tutorial/tutorial-settings-button";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

export default function SettingsScreen() {
  const { globalStyles } = useStyles();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView style={globalStyles.backgroundColor}>
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
