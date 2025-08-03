import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Details = () => {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-5xl text-dark-200">Movie Details for {id}</Text>
    </View>
  );
};

export default Details;
const styles = StyleSheet.create({});
