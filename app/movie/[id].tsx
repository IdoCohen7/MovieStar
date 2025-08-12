import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { fetchMovieDetails } from "@/services/api";
import useFetch from "@/services/useFetch";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : Platform.OS === "web"
    ? "http://localhost:3000"
    : "http://10.0.0.11:3000"; // עדכן ל-IP שלך אם צריך ל-iOS/מכשיר

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value ?? "N/A"}
    </Text>
  </View>
);

const Details: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const movieId = useMemo(() => String(id as string), [id]);

  const { user, authFetch } = useAuth();

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // בדיקה אם הסרט כבר שמור (JWT)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user || !movieId) return;
      try {
        const res = await authFetch(`${API_BASE}/saved/${movieId}`, {
          method: "GET",
        });
        if (!res.ok) return; // אם אין 200 לא מפילים את המסך
        const data = await res.json().catch(() => null);
        if (mounted) setSaved(Boolean(data?.saved));
      } catch {
        // מתעלמים משגיאות רשת נקודתיות
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, movieId, authFetch]);

  const toggleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!user) {
      Alert.alert("Login required", "Please log in to save movies.");
      return;
    }
    setSaving(true);
    try {
      if (!saved) {
        // POST /saved  { movieId }
        const res = await authFetch(`${API_BASE}/saved`, {
          method: "POST",
          body: JSON.stringify({ movieId }),
        });
        if (res.ok) {
          setSaved(true);
        } else {
          const msg = await res.text().catch(() => "");
          Alert.alert("Error", msg || "Failed to save movie.");
        }
      } else {
        // DELETE /saved/:movieId
        const res = await authFetch(`${API_BASE}/saved/${movieId}`, {
          method: "DELETE",
        });
        if (res.ok || res.status === 204) {
          setSaved(false);
        } else {
          const msg = await res.text().catch(() => "");
          Alert.alert("Error", msg || "Failed to remove saved movie.");
        }
      }
    } catch (e: any) {
      Alert.alert("Network Error", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1 items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          <TouchableOpacity
            onPress={toggleSave}
            disabled={saving}
            activeOpacity={0.85}
            className={`absolute bottom-5 right-5 rounded-full size-14 flex items-center justify-center ${
              saved ? "bg-accent" : "bg-white"
            }`}
          >
            <Image
              source={icons.save}
              className="w-6 h-7"
              resizeMode="stretch"
              tintColor={saved ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>

          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">
              {movie?.runtime} minutes
            </Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g: any) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies
                ?.map((c: any) => c.name)
                .join(" • ") || "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Details;
