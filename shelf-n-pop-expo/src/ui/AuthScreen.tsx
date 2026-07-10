import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Image, Pressable, View, ImageStyle, TextStyle, ViewStyle } from "react-native";
import { supabase } from "../lib/supabase";
import { passwordRedirectTo } from "../domain/appHelpers";
import { Text, TextInput } from "./Primitives";
import { Label, PrimaryButton } from "./FormPrimitives";

type AuthScreenStyles = {
  authWrap: ViewStyle;
  brandBlock: ViewStyle;
  authLogo: ImageStyle;
  logoMark: TextStyle;
  mutedText: TextStyle;
  panel: ViewStyle;
  input: TextStyle;
  linkButton: ViewStyle;
  linkText: TextStyle;
};

interface AuthScreenProps {
  styles: AuthScreenStyles;
}

const APP_LOGO = require("../../assets/shelf-n-pop-logo.png");

export function AuthScreen({ styles }: AuthScreenProps) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const sendPasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert("Enter your email", "Type your account email first, then request the reset link.");
      return;
    }

    setBusy(true);
    const redirectTo = passwordRedirectTo();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, redirectTo ? { redirectTo } : undefined);
    setBusy(false);

    if (error) {
      Alert.alert("Reset failed", error.message);
      return;
    }

    Alert.alert("Reset email sent", "Check your inbox for the password reset link.");
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Enter your email and password.");
      return;
    }

    if (mode === "signUp" && password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Please re-enter your password.");
      return;
    }

    setBusy(true);
    const result =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);

    if (result.error) {
      Alert.alert("Authentication failed", result.error.message);
      return;
    }

    if (mode === "signUp") {
      Alert.alert("Account created", "You can start using Shelf-n-Pop.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authWrap}>
      <View style={styles.brandBlock}>
        <Image source={APP_LOGO} style={styles.authLogo} />
        <Text style={styles.logoMark}>Shelf-n-Pop</Text>
        <Text style={styles.mutedText}>Track. Value. Share your collection.</Text>
      </View>

      <View style={styles.panel}>
        <Label>Email</Label>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="collector@email.com"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />

        <Label>Password</Label>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />

        {mode === "signUp" && (
          <>
            <Label>Confirm Password</Label>
            <TextInput
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#8c95a3"
              style={styles.input}
            />
          </>
        )}

        <PrimaryButton
          label={busy ? "Working..." : mode === "signIn" ? "Log In" : "Create Account"}
          onPress={submit}
          disabled={busy}
        />

        {mode === "signIn" ? (
          <Pressable onPress={sendPasswordReset} disabled={busy} style={styles.linkButton}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            {mode === "signIn" ? "Create an account" : "I already have an account"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
