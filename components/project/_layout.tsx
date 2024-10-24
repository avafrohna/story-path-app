import React from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function ProjectsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E57B89',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#ddd',
        },
      }}
    >
      <Tabs.Screen 
        name="details" 
        options={{ 
          title: "Project Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="qrcode" 
        options={{ 
          title: "QR Code Scanner",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" color={color} size={size} />
          ),
        }} 
      />
    </Tabs>
  );
}