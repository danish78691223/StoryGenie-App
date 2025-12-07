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


export default function StoryViewer() {
  const { character, storyType, ageGroup, language } = useLocalSearchParams();

  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [bgMusic, setBgMusic] = useState(null); // ✅ new Audio instance storage

  const selectedLanguage = language || "English";

  useEffect(() => {
    generateStory();
    return () => stopBackgroundMusic(); // cleanup
  }, []);

  // ---------------- STORY GENERATION ----------------
  const generateStory = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://storygenie-backend.onrender.com/api/generate-story", {
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

      if (data.story) {
        setStory(data.story);
        generateImages(data.story, selectedLanguage);
      } else {
        setStory("Story not available.");
      }
    } catch (error) {
      console.log("Error:", error);
      setStory("Failed to generate story.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- IMAGE GENERATION ----------------
  const generateImages = (storyText, lang) => {
    try {
      const scenes = [
        `Cute colorful illustration, kids story, language: ${lang}. Scene: ${storyText.slice(0, 120)}`,
        `Magical cartoon style, fairytale, language: ${lang}. Scene: ${storyText.slice(120, 260)}`,
        `Happy ending illustration, book art, language: ${lang}. Scene: ${storyText.slice(260, 420)}`,
      ];

      const urls = scenes.map(
        (prompt) =>
          `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
      );

      setImages(urls);
    } catch (error) {
      console.log("Image error:", error);
    }
  };

  // ---------------- SAVE STORY ----------------
  const saveStory = async () => {
    try {
      const newStory = {
        id: Date.now().toString(),
        character,
        storyType,
        ageGroup,
        language,
        story,
        images,
        date: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("savedStories");
      const savedStories = existing ? JSON.parse(existing) : [];

      savedStories.push(newStory);

      await AsyncStorage.setItem("savedStories", JSON.stringify(savedStories));

      alert("Story Saved Successfully! 🎉");
    } catch (err) {
      console.log("Save error:", err);
      alert("Failed to save story.");
    }
  };

  // ---------------- MUSIC CATEGORY SELECTOR ----------------
  const getMusicFile = () => {
    const lower = storyType?.toLowerCase() || "";

    try {
      if (lower.includes("adventure")) return require("@/assets/audio/Adventure.mp3");
      if (lower.includes("funny")) return require("@/assets/audio/Funny.mp3");
      if (lower.includes("moral")) return require("@/assets/audio/Moral.mp3");
      if (lower.includes("fairy")) return require("@/assets/audio/FairyTale.mp3");
      if (lower.includes("fantasy")) return require("@/assets/audio/Fantasy.mp3");
      if (lower.includes("inspirational"))
        return require("@/assets/audio/Inspirational.mp3");
      if (lower.includes("space")) return require("@/assets/audio/SpaceStory.mp3");
      if (lower.includes("bedtime")) return require("@/assets/audio/Bedtime.mp3");
      if (lower.includes("mystery")) return require("@/assets/audio/Mystery.mp3");

      return require("@/assets/audio/Common.mp3"); // fallback
    } catch (e) {
      console.log("Audio load error:", e);
      return require("@/assets/audio/Common.mp3");
    }
  };

  // ---------------- PLAY MUSIC (expo-audio) ----------------
  const playBackgroundMusic = async () => {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync(getMusicFile());
    await sound.setIsLoopingAsync(true);
    await sound.setVolumeAsync(0.4);

    setBgMusic(sound);
    await sound.playAsync();
  } catch (err) {
    console.log("Music Error:", err);
  }
};


  // ---------------- STOP MUSIC ----------------
  const stopBackgroundMusic = async () => {
  try {
    if (bgMusic) {
      await bgMusic.stopAsync();
      await bgMusic.unloadAsync();
      setBgMusic(null);
    }
  } catch (err) {
    console.log("Stop Music Error:", err);
  }
};



  // ---------------- SPEECH LOGIC ----------------
  const speakStory = () => {
    if (!story) return;

    let langCode = "en-US";
    if (language === "Hindi") langCode = "hi-IN";
    if (language === "Marathi") langCode = "mr-IN";
    if (language === "Urdu") langCode = "ur-IN";

    setSpeaking(true);
    playBackgroundMusic();

    Speech.stop();
    Speech.speak(story, {
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
    });
  };

  const stopStory = () => {
    Speech.stop();
    stopBackgroundMusic();
    setSpeaking(false);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4C6EF5" />
          <Text style={styles.loadingText}>Generating your magic story...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {/* ----- IMAGE SLIDER ----- */}
          {images.length > 0 && (
            <ScrollView horizontal style={styles.imageScroll}>
              {images.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.storyImage} />
              ))}
            </ScrollView>
          )}

          {/* SAVE BUTTON */}
          <TouchableOpacity style={styles.saveButton} onPress={saveStory}>
            <Text style={styles.saveButtonText}>💾 Save Story</Text>
          </TouchableOpacity>

          {/* TTS BUTTON */}
          <TouchableOpacity
            style={styles.ttsButton}
            onPress={speaking ? stopStory : speakStory}
          >
            <Text style={styles.ttsButtonText}>
              {speaking ? "⛔ Stop Reading" : "🔊 Read Story Aloud"}
            </Text>
          </TouchableOpacity>

          {/* STORY TEXT */}
          <View style={styles.storyBox}>
            <Text style={styles.languageTag}>Language: {selectedLanguage}</Text>
            <Text style={styles.storyText}>{story}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F7F9FC" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#555" },

  imageScroll: { marginBottom: 20 },
  storyImage: {
    width: 220,
    height: 220,
    borderRadius: 15,
    marginRight: 15,
    backgroundColor: "#ddd",
  },

  storyBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 2,
  },

  languageTag: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
    fontStyle: "italic",
  },

  storyText: { fontSize: 18, lineHeight: 28, color: "#333" },

  saveButton: {
    backgroundColor: "#4C6EF5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  ttsButton: {
    backgroundColor: "#4C6EF5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  ttsButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
