import { View, Text, Button } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>StoryGenie</Text>

      <Button title="Create New Story" onPress={() => navigation.navigate("CreateStory")} />
      <Button title="Saved Stories" onPress={() => navigation.navigate("SavedStories")} />
    </View>
  );
}
