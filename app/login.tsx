import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
      // On success the auth gate swaps to the tabs automatically.
    } catch (e) {
      // Surface the thrown message: ApiNetworkError => "can't reach server", the
      // auth service => "invalid credentials" (401) or "something went wrong" (5xx).
      // Never assume bad credentials for a transport failure we couldn't classify.
      setError(
        e instanceof Error ? e.message : "Invalid username or password.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-10">
            <Text className="text-4xl font-extrabold text-white tracking-tight">
              Calimali
            </Text>
            <Text className="text-zinc-500 text-sm font-semibold uppercase tracking-widest mt-2">
              Sign in to continue
            </Text>
          </View>

          <Input
            label="Username"
            icon="user"
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
          />
          <Input
            label="Password"
            icon="lock"
            placeholder="password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {error && (
            <Text className="text-red-500 text-sm mb-4 -mt-1">{error}</Text>
          )}

          <Button
            title={submitting ? "Signing in..." : "Log in"}
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={!canSubmit}
            className="mt-2"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
