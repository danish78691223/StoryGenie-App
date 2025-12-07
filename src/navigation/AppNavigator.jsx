import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import CreateStoryScreen from "../screens/CreateStoryScreen";
import StoryViewerScreen from "../screens/StoryViewerScreen";
import SavedStoriesScreen from "../screens/SavedStoriesScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
        <Stack.Screen name="StoryViewer" component={StoryViewerScreen} />
        <Stack.Screen name="SavedStories" component={SavedStoriesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
