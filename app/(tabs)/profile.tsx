import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000" // Android emulator
    : Platform.OS === "web"
    ? "http://localhost:3000" // Web browser
    : "http://10.0.0.7:3000"; // iOS device/simulator (replace with your machine's IP)

const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleLogin = async () => {
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
      const data = await res.json();
      if (res.ok) {
        await login(data); // stores user in context + AsyncStorage
        setEmail("");
        setPassword("");
      } else {
        setErr(data?.error ?? "Login failed.");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Network error.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView className="bg-primary flex-1 px-6">
        <View className="flex-1 justify-center gap-4">
          <Text className="text-white text-2xl font-semibold text-center">
            Welcome back
          </Text>

          <View className="gap-2">
            <Text className="text-gray-300">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
              className="bg-white/10 text-white rounded-xl px-4 py-3"
            />
          </View>

          <View className="gap-2">
            <Text className="text-gray-300">Password</Text>
            <View className="bg-white/10 rounded-xl px-4 flex-row items-center">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPwd}
                className="text-white flex-1 py-3"
              />
              <Text
                onPress={() => setShowPwd((s) => !s)}
                className="text-gray-300 py-3"
              >
                {showPwd ? "Hide" : "Show"}
              </Text>
            </View>
          </View>

          {err ? <Text className="text-red-400 text-sm">{err}</Text> : null}

          <View className="mt-2">
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Button title="Login" onPress={handleLogin} />
            )}
          </View>

          <Text className="text-gray-400 text-center mt-2">
            No account? Sign up coming soon.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary flex-1 px-10">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <View className="flex justify-center items-center flex-1 flex-col gap-5">
        <Image source={icons.person} className="size-10" />
        <Text className="text-white text-lg">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-gray-400">{user.email}</Text>
        <Button title="Logout" onPress={logout} />
      </View>
    </SafeAreaView>
  );
};

export default Profile;
