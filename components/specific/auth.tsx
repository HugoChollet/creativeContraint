import { useStyles } from "@/hooks/use-styles";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Spacer } from "../generic/spacer";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { globalStyles } = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("[Auth] signInWithPassword failed", error);
      setErrorMessage(error.message); // On stocke l'erreur au lieu de l'alerte
    } else {
      setErrorMessage(null); // On reset si ça réussit
    }
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

    if (error) {
      console.error("[Auth] signUp failed", error);
      setErrorMessage(error.message); // On stocke l'erreur au lieu de l'alerte
    } else {
      setErrorMessage(null); // On reset si ça réussit
    }
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <View style={{ height: 420 }}>
      {/* TODO Not good practice but buggy otherwise on Mobile */}
      <Text style={globalStyles.subtitle}>{t("component:auth.title")}</Text>
      <View style={globalStyles.shadeContainer}>
        <View style={styles.verticallySpaced}>
          <Text style={globalStyles.label}>{t("component:auth.email")}</Text>
          <TextInput
            style={globalStyles.input}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            placeholderTextColor="#666"
            autoCapitalize={"none"}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Text style={globalStyles.label}>{t("component:auth.password")}</Text>
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

        {errorMessage && (
          <View>
            <Text style={globalStyles.alertText}>{errorMessage}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[globalStyles.secondaryButton, loading && { opacity: 0.7 }]}
          disabled={loading}
          onPress={() => signInWithEmail()}
        >
          <Text style={globalStyles.secondaryButtonText}>
            {t("component:auth.sign_in")}
          </Text>
        </TouchableOpacity>

        <Spacer height={8} />

        <TouchableOpacity
          style={[globalStyles.borderButton]}
          disabled={loading}
          onPress={() => signUpWithEmail()}
        >
          <Text style={globalStyles.borderButtonText}>
            {t("component:auth.register")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    marginBottom: 16,
    alignSelf: "stretch",
  },
});
