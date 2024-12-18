import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from './usercontext';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';

/**
 * UserContent component that customizes the content of the navigation drawer.
 * Displays the app name, current user's username, and list of available navigation items.
 * 
 * @component
 * @param {DrawerContentComponentProps} props - Props provided by Drawer navigator for rendering drawer items.
 * @returns {JSX.Element} Customized drawer content with user information and navigation items.
 */
export default function UserContent(props: DrawerContentComponentProps) {
  // Retrieves the username from the user context
  const { username } = useUser();

  return (
    <DrawerContentScrollView {...props}>
      {/* Header with the app name */}
      <View style={styles.header}>
        <Text style={styles.appName}>StoryPath</Text>
      </View>
      {/* User info */}
      <View style={styles.userInfo}>
        <Text style={styles.username}>Current User: {username}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

// Styles for the UserContent component
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  appName: { fontSize: 18, fontWeight: 'bold', color: '#81A6C7', marginLeft: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  username: { marginLeft: 8, fontSize: 14, color: '#666' },
});
