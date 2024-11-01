import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProjectDetails from './projectdetails';
import MapScreen from './map';
import QRCodeScanner from './qrcode';

const Tab = createBottomTabNavigator();

type ProjectDetailsTabsProps = {
  projectId: number;
};

export default function ProjectDetailsTabs({ projectId }: ProjectDetailsTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#81A6C7',
        },
        headerTintColor: '#FFFFFF',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: '#81A6C7',
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#cccccc',
      }}
    >
      <Tab.Screen
        name="ProjectDetails"
        options={{
          title: "Homepage",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      >
        {() => <ProjectDetails projectId={projectId} />}
      </Tab.Screen>
      <Tab.Screen
        name="MapScreen"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={size} />
          ),
        }}
      >
        {() => (
          <MapScreen projectId={projectId} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="QRCodeScanner"
        options={{
          title: "QR Code Scanner",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" color={color} size={size} />
          ),
        }}
      >
        {() => (
          <QRCodeScanner projectId={projectId} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
