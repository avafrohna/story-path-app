import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProjectDetails from './projectdetails';
import MapScreen from './map';
import QRCodeScanner from './qrcode';
import { ProjectID } from '@/types/types';

// Initialize bottom tabs
const Tab = createBottomTabNavigator();

/**
 * ProjectDetailsTabs component sets up a bottom tab navigator
 * for viewing project details, a map, and a QR code scanner.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {number} props.projectId - Unique identifier for the project to be displayed in each tab.
 * @returns {JSX.Element} The bottom tab navigator with ProjectDetails, MapScreen, and QRCodeScanner screens.
 */
export default function ProjectDetailsTabs({ projectId }: ProjectID) {
  return (
    // Styling and settings for the tab navigator
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
      {/* Project Homepage Tab */}
      <Tab.Screen
        name="ProjectDetails"
        options={{
          title: "Homepage",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      >
        {/* Pass projectId as a prop component */}
        {() => <ProjectDetails projectId={projectId} />}
      </Tab.Screen>
      {/* Map Screen Tab */}
      <Tab.Screen
        name="MapScreen"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={size} />
          ),
        }}
      >
        {/* Pass projectId as a prop component */}
        {() => <MapScreen projectId={projectId} />}
      </Tab.Screen>
      {/* QR Code Scanner Tab */}
      <Tab.Screen
        name="QRCodeScanner"
        options={{
          title: "QR Code Scanner",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" color={color} size={size} />
          ),
        }}
      >
        {/* Pass projectId as a prop component */}
        {() => <QRCodeScanner projectId={projectId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
