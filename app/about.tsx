import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * About component that provides information about the Story Path app.
 * Displays a brief description of the app's purpose and features.
 * 
 * @component
 * @returns {JSX.Element} A view with textual information about the application.
 */
export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>About Story Path</Text>
      <Text style={styles.description}>
        Welcome to the Story Path app! This application is designed to provide users with an interactive experience for exploring various projects and their locations.
      </Text>
      <Text style={styles.description}>
        Users can navigate to different locations based on their current GPS position or by scanning QR codes available at each location.
      </Text>
    </View>
  );
}

// Styles for the About component
const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  description: { fontSize: 18, color: '#555', textAlign: 'center', lineHeight: 26, marginBottom: 15 },
});
