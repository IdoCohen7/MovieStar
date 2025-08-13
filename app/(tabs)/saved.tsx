import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { fetchMovieDetails } from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SavedRow = { movie_id: string; created_at: string };

const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : Platform.OS === "web"
    ? "http://localhost:3000"
    : "http://10.0.0.10:3000"; // iOS/device: use your machine IP

const Saved: React.FC = () => {
  const { user, authFetch } = useAuth();

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // loading only for list container
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      // GET /saved  (JWT on Authorization header via authFetch)
      const res = await authFetch(`${API_BASE}/saved`, { method: "GET" });
      const rows: SavedRow[] = await res.json();

      const details = await Promise.all(
        rows.map((r) => fetchMovieDetails(String(r.movie_id)).catch(() => null))
      );

      setMovies(details.filter(Boolean));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load saved movies.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authFetch]);

  useEffect(() => {
    user?.id && loadSaved();
  }, [user?.id, loadSaved]);

  useFocusEffect(
    useCallback(() => {
      user?.id && loadSaved();
    }, [loadSaved, user?.id])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSaved();
    setRefreshing(false);
  }, [loadSaved]);

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

      <SafeAreaView
        edges={["top", "right", "left", "bottom"]}
        className="flex-1 bg-transparent mt-1"
      >
        {!user ? (
          <View className="flex-1 items-center justify-center px-10">
            <Image source={icons.save} className="size-10" />
            <Text className="text-gray-400 mt-3">
              Please log in to see your saved movies.
            </Text>
          </View>
        ) : (
          <View className="flex-1">
            {/* Header: always visible */}
            <View className="items-center mt-6 mb-3 px-4">
              <Image
                source={images.starLogo}
                className="w-28 h-28 mb-5 mx-auto"
                resizeMode="contain"
              />
              <Text className="text-white text-xl font-semibold mt-4 self-start">
                {`${user.firstName + " " + user.lastName + "'s "}Saved Movies`}
              </Text>
            </View>

            {/* List container: handles loading/empty/error */}
            <View className="flex-1 px-4">
              {error ? (
                <View className="flex-1 items-center justify-center gap-2">
                  <Text className="text-red-400">{error}</Text>
                  <TouchableOpacity onPress={() => loadSaved()}>
                    <Text className="text-white underline">Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator />
                </View>
              ) : movies.length === 0 ? (
                <View className="flex-1 items-center justify-center gap-3">
                  <Image source={icons.save} className="size-10" />
                  <Text className="text-gray-400">No saved movies yet.</Text>
                </View>
              ) : (
                <FlatList
                  data={movies}
                  renderItem={({ item }) => <MovieCard {...item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                  className="flex-1"
                  columnWrapperStyle={{
                    justifyContent: "flex-start",
                    gap: 20,
                    paddingRight: 5,
                    marginBottom: 10,
                  }}
                  contentContainerStyle={{
                    paddingBottom: 32,
                    paddingHorizontal: 0,
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor="#ffffff"
                    />
                  }
                />
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Saved;
