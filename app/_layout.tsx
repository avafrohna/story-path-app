import React from 'react';
import CustomDrawerContent from '../components/currentuser';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { UserProvider } from '../components/usercontext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
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
