import { ThemedText } from "@/components/generic/themed-text";
import { useProfile } from "@/hooks/use-profile";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Spacer } from "../generic/spacer";

export default function Account({ session }: { session: Session }) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  // Define the shape of your profile
  const { data, setData, loading, updateData } = useProfile("profiles", {
    username: "",
    website: "",
    avatar_url: "",
  });

  return (
    <>
      <Text style={globalStyles.subtitle}>{t("component:auth.title")}</Text>
      <View style={globalStyles.shadeContainer}>
        {/* Email Field (Read Only) */}
        <Text style={globalStyles.label}>
          {t("component:account.email_read_only")}
        </Text>
        <TextInput
          value={session?.user?.email}
          editable={false}
          style={[globalStyles.input, { opacity: 0.5, cursor: "not-allowed" }]}
        />
        <Spacer height={20} />

        {/* Username Field */}
        <Text style={globalStyles.label}>
          {t("component:account.username")}
        </Text>
        <TextInput
          value={data.username || ""}
          onChangeText={(text) => setData({ ...data, username: text })}
          placeholder={t("component:account.username_placeholder")}
          style={globalStyles.input}
          placeholderTextColor={colors.textDiscreet}
        />
        <Spacer height={20} />

        {/* Website Field */}
        <Text style={globalStyles.label}>
          {t("component:account.portfolio")}
        </Text>
        <TextInput
          value={data.website || ""}
          onChangeText={(text) => setData({ ...data, website: text })}
          placeholder="https://..."
          placeholderTextColor={colors.textDiscreet}
          style={globalStyles.input}
        />
        <Spacer height={20} />

        <TouchableOpacity
          style={globalStyles.secondaryButton}
          onPress={() => updateData(data)}
          disabled={loading}
        >
          <ThemedText style={globalStyles.secondaryButtonText}>
            {loading
              ? t("component:account.saving")
              : t("component:account.update_profile")}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          style={[globalStyles.secondaryButton, globalStyles.alertButton]}
        >
          <Text style={globalStyles.alertText}>
            {t("component:account.sign_out")}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
