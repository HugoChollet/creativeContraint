import { useStyles } from "@/hooks/use-styles";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/themed-text";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Text style={globalStyles.title}>{t("component:auth.title")}</Text>
      <View style={globalStyles.shadeContainer}>
        <Text style={globalStyles.label}>
          {t("component:account.email_read_only")}
        </Text>
        <View style={styles.verticallySpaced}>
          <TextInput
            value={session?.user?.email}
            editable={false}
            style={[globalStyles.input, { opacity: 0.5 }]}
          />
        </View>

        <Text style={globalStyles.label}>{t("component:account.username")}</Text>
        <View style={styles.verticallySpaced}>
          <TextInput
            value={username || ""}
            onChangeText={setUsername}
            placeholder={t("component:account.username_placeholder")}
            placeholderTextColor={colors.placeholder}
            style={globalStyles.input}
          />
        </View>

        <Text style={globalStyles.label}>{t("component:account.portfolio")}</Text>
        <View style={styles.verticallySpaced}>
          <TextInput
            value={website || ""}
            onChangeText={setWebsite}
            placeholder="https://..."
            placeholderTextColor={colors.placeholder}
            style={globalStyles.input}
          />
        </View>

        <TouchableOpacity
          style={globalStyles.secondaryButton}
          onPress={() =>
            updateProfile({ username, website, avatar_url: avatarUrl })
          }
          disabled={loading}
        >
          <ThemedText style={globalStyles.secondaryButtonText}>
            {loading
              ? t("component:account.saving")
              : t("component:account.update_profile")}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.secondaryButton, globalStyles.alertButton]}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={globalStyles.alertText}>
            {t("component:account.sign_out")}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    marginBottom: 20,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
