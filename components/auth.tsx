import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  AppState,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useStyles } from "../hooks/use-styles";
import { supabase } from "../lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { globalStyles, colors } = useStyles();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <>
      <Text style={globalStyles.title}>{t("common:auth.title")}</Text>
      <View style={globalStyles.shadeContainer}>
        <View style={styles.verticallySpaced}>
          <Text style={globalStyles.label}>{t("common:auth.email")}</Text>
          <TextInput
            style={globalStyles.input}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            placeholderTextColor="#666"
            autoCapitalize={"none"}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Text style={globalStyles.label}>{t("common:auth.password")}</Text>
          <TextInput
            style={globalStyles.input}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor="#666"
            autoCapitalize={"none"}
          />
        </View>

        <TouchableOpacity
          style={[globalStyles.secondaryButton, loading && { opacity: 0.7 }]}
          disabled={loading}
          onPress={() => signInWithEmail()}
        >
          <Text style={globalStyles.secondaryButtonText}>
            {t("common:auth.sign_in")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.transparentButton]}
          disabled={loading}
          onPress={() => signUpWithEmail()}
        >
          <Text style={globalStyles.transparentButtonText}>
            {t("common:auth.register")}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    marginBottom: 16,
    alignSelf: "stretch",
  },
});
