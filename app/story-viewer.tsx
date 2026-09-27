// app/story-viewer.tsx
// @ts-nocheck

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

const BACKEND_URL = "https://storygenie-backend.onrender.com";

export default function StoryViewer() {
  const params = useLocalSearchParams();
  const { character, storyType, ageGroup, language, storyData, fromSaved } = params;

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [bgMusic, setBgMusic] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectedLanguage = language || "English";

  useEffect(() => {
    loadOrGenerateStory();
    return () => {
      Speech.stop();
      stopBackgroundMusic();
    };
  }, []);

  const loadOrGenerateStory = async () => {
    try {
      setLoading(true);

      if (fromSaved === "true") {
        const savedData = await AsyncStorage.getItem("currentStory");
        if (!savedData) throw new Error("Saved story could not be loaded.");
        setStory(JSON.parse(savedData));
        return;
      }

      const response = await fetch(BACKEND_URL + "/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character,
          storyType,
          ageGroup,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Story generation failed.");
      }

      setStory(data);
    } catch (error) {
      console.log("Story error:", error);
      setStory({
        title: "Story unavailable",
        paragraphs: [
          {
            id: "error",
            text: error?.message || "Failed to generate story.",
            image: null,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStory = async () => {
    if (!story || saving) return;

    try {
      setSaving(true);

      const newStory = {
        id: Date.now().toString(),
        character,
        storyType,
        ageGroup,
        language: selectedLanguage,
        title: story.title,
        styleGuide: story.styleGuide,
        characters: story.characters || [],
        paragraphs: story.paragraphs || [],
        story: story.story,
        images: (story.paragraphs || [])
          .map((paragraph) => paragraph.image)
          .filter(Boolean),
        date: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("savedStories");
      const savedStories = existing ? JSON.parse(existing) : [];

      savedStories.push(newStory);
      await AsyncStorage.setItem("savedStories", JSON.stringify(savedStories));

      alert("Story saved successfully! 🎉");
    } catch (error) {
      console.log("Save error:", error);
      alert("Could not save this story.");
    } finally {
      setSaving(false);
    }
  };

  const getMusicFile = () => {
    const lower = String(storyType || "").toLowerCase();

    if (lower.includes("adventure")) return require("@/assets/audio/Adventure.mp3");
    if (lower.includes("funny")) return require("@/assets/audio/Funny.mp3");
    if (lower.includes("moral")) return require("@/assets/audio/Moral.mp3");
    if (lower.includes("fairy")) return require("@/assets/audio/FairyTale.mp3");
    if (lower.includes("fantasy")) return require("@/assets/audio/Fantasy.mp3");
    if (lower.includes("inspirational")) return require("@/assets/audio/Inspirational.mp3");
    if (lower.includes("space")) return require("@/assets/audio/SpaceStory.mp3");
    if (lower.includes("bedtime")) return require("@/assets/audio/Bedtime.mp3");
    if (lower.includes("mystery")) return require("@/assets/audio/Mystery.mp3");

    return require("@/assets/audio/Common.mp3");
  };

  const playBackgroundMusic = async () => {
    try {
      if (bgMusic) return;

      const sound = new Audio.Sound();
      await sound.loadAsync(getMusicFile());
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(0.35);
      setBgMusic(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Music error:", error);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (bgMusic) {
        await bgMusic.stopAsync();
        await bgMusic.unloadAsync();
        setBgMusic(null);
      }
    } catch (error) {
      console.log("Stop music error:", error);
    }
  };

  const speakStory = async () => {
    if (!story?.paragraphs?.length) return;

    let langCode = "en-US";
    if (selectedLanguage === "Hindi") langCode = "hi-IN";
    if (selectedLanguage === "Marathi") langCode = "mr-IN";
    if (selectedLanguage === "Urdu") langCode = "ur-IN";

    setSpeaking(true);
    await playBackgroundMusic();
    Speech.stop();

    Speech.speak(
      story.paragraphs.map((p) => p.text).join(" "),
      {
        language: langCode,
        rate: 0.95,
        pitch: 1,
        onDone: () => {
          stopBackgroundMusic();
          setSpeaking(false);
        },
        onStopped: () => {
          stopBackgroundMusic();
          setSpeaking(false);
        },
        onError: () => {
          stopBackgroundMusic();
          setSpeaking(false);
        },
      }
    );
  };

  const stopStory = () => {
    Speech.stop();
    stopBackgroundMusic();
    setSpeaking(false);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <View style={styles.magicIcon}>
          <Text style={styles.magicIconText}>✨</Text>
        </View>
        <Text style={styles.loadingTitle}>Creating your story...</Text>
        <Text style={styles.loadingText}>
          Gemini is writing the story and illustrating each scene.
        </Text>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  const paragraphs = story?.paragraphs || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.appLabel}>✨ STORYGENIE</Text>
          <Text style={styles.title}>{story?.title || "Your Story"}</Text>
          <Text style={styles.meta}>
            {selectedLanguage} • {storyType} • {ageGroup}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={saveStory}>
            <Text style={styles.actionText}>
              {saving ? "Saving..." : "💾 Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={speaking ? stopStory : speakStory}
          >
            <Text style={styles.actionText}>
              {speaking ? "⛔ Stop" : "🔊 Read"}
            </Text>
          </TouchableOpacity>
        </View>

        {paragraphs.map((paragraph, index) => (
          <View key={paragraph.id || index} style={styles.paragraphCard}>
            <View style={styles.chapterRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <Text style={styles.chapterLabel}>SCENE {index + 1}</Text>
            </View>

            <Text style={styles.paragraphText}>{paragraph.text}</Text>

            {paragraph.image ? (
              <Image
                source={{ uri: paragraph.image }}
                style={styles.paragraphImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imageUnavailable}>
                <Text style={styles.imageUnavailableIcon}>🖼️</Text>
                <Text style={styles.imageUnavailableText}>
                  Illustration unavailable for this scene
                </Text>
              </View>
            )}

            {index < paragraphs.length - 1 && (
              <View style={styles.sceneDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerIcon}>✦</Text>
                <View style={styles.dividerLine} />
              </View>
            )}
          </View>
        ))}

        <View style={styles.endCard}>
          <Text style={styles.endEmoji}>🌟</Text>
          <Text style={styles.endTitle}>The End</Text>
          <Text style={styles.endText}>Thanks for reading with StoryGenie.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingTop: 54,
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F6F7FB",
  },
  magicIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E9E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  magicIconText: {
    fontSize: 34,
  },
  loadingTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#24243A",
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 15,
    color: "#707080",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  appLabel: {
    color: "#6C63FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    color: "#202033",
    marginBottom: 9,
  },
  meta: {
    fontSize: 13,
    color: "#777789",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#6C63FF",
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  paragraphCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  numberText: {
    color: "#6C63FF",
    fontWeight: "900",
  },
  chapterLabel: {
    color: "#777789",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  paragraphText: {
    fontSize: 18,
    lineHeight: 29,
    color: "#30303D",
    marginBottom: 16,
  },
  paragraphImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: "#E9E9EF",
  },
  imageUnavailable: {
    height: 180,
    borderRadius: 18,
    backgroundColor: "#F0F0F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  imageUnavailableIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  imageUnavailableText: {
    color: "#858593",
    textAlign: "center",
  },
  sceneDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E6E6EC",
  },
  dividerIcon: {
    color: "#B1ADD9",
    marginHorizontal: 10,
  },
  endCard: {
    alignItems: "center",
    backgroundColor: "#EEE CFF".replace(" ", ""),
    borderRadius: 22,
    padding: 24,
    marginTop: 4,
  },
  endEmoji: {
    fontSize: 34,
    marginBottom: 7,
  },
  endTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#303044",
  },
  endText: {
    marginTop: 6,
    color: "#747487",
  },
});
