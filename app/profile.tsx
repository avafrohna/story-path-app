import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../components/usercontext';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

/**
 * Profile component that allows the user to set their username and select a profile image.
 * Uses expo-image-picker to access the media library for profile image selection.
 * Displays error messages for permission denial or other unexpected issues.
 *
 * @component
 * @returns {JSX.Element} The profile view with image picker and username input.
 */
export default function Profile() {
  const { username, setUsername, profilePicture, setProfilePicture } = useUser();

  /**
   * Handles the selection of a profile image using expo-image-picker.
   * Requests media library permissions and, if granted, opens the image library.
   * Sets the profile picture URI upon successful image selection.
   * Displays an alert if the permission is not granted or another error occurs.
   */
  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
      }
      
      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      // Set profile picture URI if the user selects an image
      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    } 
    catch (error) {
      console.error('ImagePicker Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile image selection */}
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imagePickerText}>Select a Profile Image</Text>
        )}
      </TouchableOpacity>
      {/* TextInput allows the user to set their username */}
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username || ''}
        onChangeText={setUsername}
      />
    </View>
  );
}

// Styles for the Profile component
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#FFFFFF' },
  imagePicker: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20, overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  imagePickerText: { color: '#888', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 20, backgroundColor: '#f9f9f9' },
});
