import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from './usercontext';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';

export default function UserContent(props: DrawerContentComponentProps) {
  const { username } = useUser();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.appName}>StoryPath</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>Current User: {username}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#81A6C7',
    marginLeft: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  username: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
