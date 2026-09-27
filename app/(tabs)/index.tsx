import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#7F7FD5", "#86A8E7", "#91EAE4"]}
      style={styles.container}
    >
      <Text style={styles.title}>StoryGenie</Text>
      <Text style={styles.subtitle}>Create magical AI stories instantly</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/create-story")}
      >
        <Text style={styles.buttonText}>✨ Create New Story</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/saved-stories")}
      >
        <Text style={styles.secondaryText}>📚 Saved Stories</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "80%",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },
  secondaryButton: {
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryText: {
    color: "#333",
    fontSize: 17,
  },
});
