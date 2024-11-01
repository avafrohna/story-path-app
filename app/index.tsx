import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Welcome component that serves as the introductory screen for the StoryPath app.
 * Provides navigation options to create a profile or explore projects.
 * 
 * @component
 * @returns {JSX.Element} A view with welcome message and navigation buttons.
 */
export default function Welcome() {
  // Initialize router for navigation between screens.
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to StoryPath</Text>
      <Text style={styles.subtitle}>Explore Unlimited Location-based Experiences</Text>
      {/* Button to navigate to the Profile screen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.buttonText}>CREATE PROFILE</Text>
      </TouchableOpacity>
      {/* Button to navigate to the Projects screen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/projects')}
      >
        <Text style={styles.buttonText}>EXPLORE PROJECTS</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the Welcome component
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#81A6C7', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#81A6C7', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
