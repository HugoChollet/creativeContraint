import { ConfirmCancelButton } from "@/components/generic/confirm-cancel-buttons";
import { useProfile } from "@/hooks/use-profile";
import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Spacer } from "../generic/spacer";
import { ProfileImagePicker } from "./pickers/image-profile-picker";

type ProfileData = {
  username: string | null;
  website: string | null;
  avatar_url: string | null;
};

const normalizeProfile = (profile: ProfileData) => ({
  username: profile.username ?? "",
  website: profile.website ?? "",
  avatar_url: profile.avatar_url ?? "",
});

export default function Account({ session }: { session: Session }) {
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  const { data, setData, loading, fetched, updateData } =
    useProfile<ProfileData>("profiles", {
      username: "",
      website: "",
      avatar_url: "",
    });
  const [savedProfile, setSavedProfile] = useState(() =>
    normalizeProfile(data),
  );
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [profileTouched, setProfileTouched] = useState(false);

  const profileDraft = useMemo(() => normalizeProfile(data), [data]);
  const hasProfileChanges =
    profileDraft.username !== savedProfile.username ||
    profileDraft.website !== savedProfile.website ||
    profileDraft.avatar_url !== savedProfile.avatar_url;
  const canEditProfile = hasProfileChanges && !loading;

  useEffect(() => {
    if (fetched && !profileInitialized && !profileTouched) {
      setSavedProfile(profileDraft);
      setProfileInitialized(true);
    }
  }, [fetched, profileDraft, profileInitialized, profileTouched]);

  const updateProfileDraft = (updates: Partial<ProfileData>) => {
    setProfileTouched(true);
    setData((current) => ({ ...current, ...updates }));
  };

  const handleSaveProfile = async () => {
    const savedUpdates = await updateData(data);

    if (savedUpdates) {
      setSavedProfile(normalizeProfile({ ...data, ...savedUpdates }));
      setProfileTouched(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileTouched(false);
    setData((current) => ({ ...current, ...savedProfile }));
  };

  return (
    <>
      <Text style={globalStyles.subtitle}>{t("component:auth.title")}</Text>
      <View style={globalStyles.shadeContainer}>
        <ProfileImagePicker
          initialImage={data.avatar_url}
          onImageSelected={(image) =>
            updateProfileDraft({ avatar_url: image ?? "none" })
          }
        />
        <Text style={globalStyles.label}>
          {t("component:account.email_read_only")}
        </Text>
        <TextInput
          value={session?.user?.email}
          editable={false}
          style={[globalStyles.input, { opacity: 0.5, cursor: "not-allowed" }]}
        />
        <Spacer height={20} />

        <Text style={globalStyles.label}>
          {t("component:account.username")}
        </Text>
        <TextInput
          value={data.username || ""}
          onChangeText={(text) => updateProfileDraft({ username: text })}
          placeholder={t("component:account.username_placeholder")}
          style={globalStyles.input}
          placeholderTextColor={colors.textDiscreet}
        />
        <Spacer height={20} />

        <Text style={globalStyles.label}>
          {t("component:account.portfolio")}
        </Text>
        <TextInput
          value={data.website || ""}
          onChangeText={(text) => updateProfileDraft({ website: text })}
          placeholder="https://..."
          placeholderTextColor={colors.textDiscreet}
          style={globalStyles.input}
        />

        <Spacer height={20} />

        <ConfirmCancelButton
          color={colors.tint}
          labelConfirm={
            loading
              ? t("component:account.saving")
              : t("component:account.update_profile")
          }
          isActive={canEditProfile}
          isCancelActive={canEditProfile}
          isLoading={loading}
          onClickConfirm={handleSaveProfile}
          onClickCancel={handleCancelProfile}
        />
        <Spacer height={8} />
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
