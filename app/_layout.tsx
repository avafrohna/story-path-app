import React from 'react';
import UserContent from '../components/currentuser';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { UserProvider } from '../components/usercontext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Layout component that provides a drawer-based navigation layout with user context.
 * Includes header styling, drawer content, and safe area handling for improved UI.
 * 
 * @component
 * @returns {JSX.Element} The layout component with navigation and user context.
 */
export default function Layout() {
  return (
    /* Provides safe area handling across various devices. */
    <SafeAreaProvider>
      {/* UserProvider supplies user context to components within the drawer. */}
      <UserProvider>
        <Drawer
          // displays user info 
          drawerContent={(props) => <UserContent {...props} />}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#81A6C7',
            },
            headerTintColor: '#FFFFFF',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 18,
            },
            headerRight: () => (
              <Text style={{ color: '#FFFFFF', marginRight: 10, fontSize: 16 }}>
                StoryPath
              </Text>
            ),
          }}
        >
          {/* Each Drawer.Screen component represents a navigable screen within the drawer. */}
          <Drawer.Screen 
            name="index" 
            options={{ 
              title: "Welcome", 
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="home" color={color} size={size} />
              ),
            }} 
          />
          <Drawer.Screen 
            name="profile" 
            options={{ 
              title: "Profile", 
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="person" color={color} size={size} />
              ),
            }} 
          />
          <Drawer.Screen
            name="projects"
            options={{
              title: "Projects",
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="work" color={color} size={size} />
              ),
            }}
            listeners={({ navigation }) => ({
              // Overrides default drawer behavior to reset navigation on selection.
              drawerItemPress: (e) => {
                e.preventDefault();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "projects" }],
                });
              },
            })}
          />
          <Drawer.Screen 
            name="about" 
            options={{ 
              title: "About", 
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="info" color={color} size={size} />
              ),
            }} 
          />
        </Drawer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
