import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : Platform.OS === "web"
    ? "http://localhost:3000"
    : "http://10.0.0.10:3000";

type Mode = "login" | "signup";

const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setErr(null);
    if (!email.trim() || !password) {
      setErr("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErr(data?.error ?? `HTTP ${res.status}`);
        return;
      }
      // data = { user, token }
      await login(data);
      setEmail("");
      setPassword("");
    } catch (e: any) {
      setErr(e?.message ?? "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setErr(null);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !signupEmail.trim() ||
      !signupPassword
    ) {
      setErr("All fields are required.");
      return;
    }
    if (signupPassword.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErr(data?.error ?? `HTTP ${res.status}`);
        return;
      }
      // data = { user, token }
      await login(data);
      setFirstName("");
      setLastName("");
      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setErr(e?.message ?? "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  return (
    <View className="flex-1 bg-primary">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* Background image covers full screen; bg-primary stays as fallback */}
      <Image
        source={images.bg}
        resizeMode="cover"
        className="absolute top-0 left-0 w-full z-0"
      />

      {!user ? (
        <SafeAreaView
          edges={["top", "right", "left", "bottom"]}
          className="flex-1"
        >
          <Image
            source={images.starLogo}
            className="w-28 h-28 mt-7 mb-5 mx-auto"
            resizeMode="contain"
          />
          <View className="flex-1 justify-center gap-6 px-6">
            <Text className="text-white text-2xl font-semibold text-center">
              {mode === "login"
                ? "Welcome to MovieStar"
                : "Create your account"}
            </Text>

            {mode === "login" ? (
              <>
                <View className="gap-2">
                  <Text className="text-gray-300">Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white/10 text-white rounded-xl px-4 py-3"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-gray-300">Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    className="bg-white/10 text-white rounded-xl px-4 py-3"
                  />
                </View>

                {err && <Text className="text-red-400 text-sm">{err}</Text>}

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  className="bg-accent rounded-xl py-3.5 items-center mt-1 disabled:opacity-60"
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-white font-semibold">Login</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setMode("signup");
                    setErr(null);
                  }}
                >
                  <Text className="text-gray-300 text-center">
                    No account? Sign up
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="gap-2">
                  <Text className="text-gray-300">First name</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    autoCorrect={false}
                    className="bg-white/10 text-white rounded-xl px-4 py-3"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-gray-300">Last name</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    autoCorrect={false}
                    className="bg-white/10 text-white rounded-xl px-4 py-3"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-gray-300">Email</Text>
                  <TextInput
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white/10 text-white rounded-xl px-4 py-3"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-gray-300">Password</Text>
                  <TextInput
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    className="bg-white/10 text-white rounded-xl px-4 py-3"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-gray-300">Confirm password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    className="bg-white/10 text-white rounded-xl px-4 py-3"
                  />
                </View>

                {err && <Text className="text-red-400 text-sm">{err}</Text>}

                <TouchableOpacity
                  onPress={handleSignup}
                  disabled={loading}
                  className="bg-accent rounded-xl py-3.5 items-center mt-1 disabled:opacity-60"
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-white font-semibold">Sign Up</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setMode("login");
                    setErr(null);
                  }}
                >
                  <Text className="text-gray-300 text-center">
                    Already have an account? Log in
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView
          edges={["top", "right", "left", "bottom"]}
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center gap-5 px-10">
            <Image source={icons.person} className="size-10" />
            <Text className="text-white text-lg">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-gray-300">{user.email}</Text>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-white/10 rounded-xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

export default Profile;
