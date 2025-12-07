// app/saved-stories.tsx
// @ts-nocheck

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function SavedStories() {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved stories on load
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const savedData = await AsyncStorage.getItem("savedStories");
      const parsedStories = savedData ? JSON.parse(savedData) : [];
      setStories(parsedStories.reverse()); // newest first
    } catch (err) {
      console.log("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    await AsyncStorage.removeItem("savedStories");
    setStories([]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4C6EF5" />
        <Text style={{ marginTop: 10 }}>Loading saved stories...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>📚 Saved Stories</Text>

      {/* If no stories */}
      {stories.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No saved stories yet!</Text>
        </View>
      )}

      {/* Clear All Button */}
      {stories.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
          <Text style={styles.clearBtnText}>🗑 Clear All Stories</Text>
        </TouchableOpacity>
      )}

      {/* Story Cards */}
      {stories.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/story-viewer",
              params: {
                character: item.character,
                storyType: item.storyType,
                ageGroup: item.ageGroup,
                language: item.language,
                storyData: JSON.stringify(item),
                fromSaved: "true",
              },
            })
          }
        >
          {/* Thumbnail */}
          <Image
            source={{ uri: item.images[0] }}
            style={styles.thumbnail}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.character}</Text>
            <Text style={styles.cardSubtitle}>{item.storyType}</Text>
            <Text style={styles.languageTag}>Language: {item.language}</Text>

            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F7F9FC",
  },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: "center",
    color: "#4C6EF5",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyBox: {
    marginTop: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    color: "#666",
  },

  clearBtn: {
    backgroundColor: "#FF4D4D",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },

  clearBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
  },

  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#555",
  },

  languageTag: {
    marginTop: 4,
    fontSize: 14,
    color: "#4C6EF5",
  },

  date: {
    marginTop: 6,
    fontSize: 12,
    color: "#777",
  },
});
