// app/create-story.tsx
// @ts-nocheck

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import RNPickerSelect from "react-native-picker-select";

// Language Options
const LANGUAGES = ["English", "Hindi", "Marathi", "Urdu"];

// Story Type Options
const STORY_TYPES = [
  "Adventure",
  "Moral",
  "Funny",
  "Fairy Tale",
  "Fantasy",
  "Animal Story",
  "Space Story",
  "Inspirational",
  "Educational",
  "Friendship",
  "Bedtime",
  "Mystery (Kids Friendly)",
  "Other",
];

export default function CreateStory() {
  const router = useRouter();

  const [character, setCharacter] = useState("");
  const [storyType, setStoryType] = useState("");
  const [customType, setCustomType] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [language, setLanguage] = useState("English");

  const handleGenerate = () => {
    const finalType = storyType === "Other" ? customType : storyType;

    if (!character || !finalType || !ageGroup) {
      alert("Please fill all fields!");
      return;
    }

    router.push({
      pathname: "/story-viewer",
      params: {
        character,
        storyType: finalType,
        ageGroup,
        language,
      },
    });
  };

  return (
    <LinearGradient colors={["#00C9FF", "#92FE9D"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Create Your Story</Text>

        {/* Character Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter Character Name"
          placeholderTextColor="#555"
          value={character}
          onChangeText={setCharacter}
        />

        {/* Story Type Dropdown */}
        <Text style={styles.label}>Choose Story Type</Text>

        <RNPickerSelect
          onValueChange={(value) => setStoryType(value)}
          items={STORY_TYPES.map((t) => ({ label: t, value: t }))}
          placeholder={{ label: "Select Story Type", value: "" }}
          style={{
            inputIOS: styles.picker,
            inputAndroid: styles.picker,
          }}
        />

        {/* If user chooses OTHER → show custom input */}
        {storyType === "Other" && (
          <TextInput
            style={styles.input}
            placeholder="Enter Custom Story Type"
            placeholderTextColor="#555"
            value={customType}
            onChangeText={setCustomType}
          />
        )}

        {/* Age Group Input */}
        <TextInput
          style={styles.input}
          placeholder="Age Group (Kids / Teens / Adults)"
          placeholderTextColor="#555"
          value={ageGroup}
          onChangeText={setAgeGroup}
        />

        {/* Language Selector */}
        <Text style={styles.label}>Choose Story Language</Text>

        <View style={styles.languageRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageChip,
                language === lang && styles.languageChipActive,
              ]}
              onPress={() => setLanguage(lang)}
            >
              <Text
                style={[
                  styles.languageText,
                  language === lang && styles.languageTextActive,
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity style={styles.button} onPress={handleGenerate}>
          <Text style={styles.buttonText}>✨ Generate Story</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
  },
  picker: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  label: {
    marginTop: 15,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  languageChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  languageChipActive: {
    backgroundColor: "#fff",
  },
  languageText: {
    color: "#fff",
    fontWeight: "500",
  },
  languageTextActive: {
    color: "#333",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
});
