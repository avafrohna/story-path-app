import { useUser } from '../usercontext';
import { useFocusEffect } from '@react-navigation/native';
import { Location, ProjectID, Project } from '@/types/types';
import { View, Text, Button, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { trackVisit, getLocation, getUserTrackingEntries, getProject } from '../../api';
import React, { useState, useEffect, useCallback } from 'react';

/**
 * QRCodeScanner component enables users to scan QR codes to track visits to project locations.
 * Manages camera permissions, fetches tracking data, and processes scanned QR codes.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {number} props.projectId - ID of the project to be tracked.
 * @returns {JSX.Element} The QR code scanner view.
 */
export default function QRCodeScanner({ projectId }: ProjectID) {
  const { username } = useUser();
  const [scanned, setScanned] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());
  
  // Reset `scanned` state when the component gains focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  // Fetch project and user tracking entries on mount
  useEffect(() => {
    fetchProjectData();
  }, [projectId, username]);

  /**
   * Fetches tracking entries and project data to determine visited locations.
   * Updates state with fetched data.
   */
  const fetchProjectData = async () => {
    // If no username, exit
    if (!username) return;

    try {
      // Fetch all tracking entries for user
      const trackingEntries = (await getUserTrackingEntries(projectId, username)) as { location_id: number }[];
      // Select id's for all visited location from tracking entries
      const visitedIds = new Set(trackingEntries.map(entry => entry.location_id));
      setVisitedLocationIds(visitedIds);
    }
    catch (error) {
      console.error("Error fetching tracking entries:", error);
    }
  };

  // If no permission display error
  if (!permission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }

  // Ask user for permission for camera access
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  /**
   * Handles scanning of QR codes. Parses location ID from the scanned data
   * and tracks visit if conditions are met (not previously visited, etc.).
   * 
   * @param {Object} data - The data from the QR code scan.
   */
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    
    // Match scanned data to specific pattern
    const match = data.match(/\/location\/(\d+)/);
    // If id doesn't match, display error
    if (!match || !match[1]) {
      console.error("Invalid QR Code.");
      return;
    }

    // Extract location ID
    const locationId = match[1];

    try {
      // Fetch location data
      const location = await getLocation(locationId) as Location[];
      if (!location || location.length === 0) {
        console.error("Location not found.");
        return;
      }

      setLocationName(location[0].location_name);

      // If no username exit
      if (!username) return;
      // If already visited exit
      if (visitedLocationIds.has(location[0].id)) return;
      // If trigger is location entry exit
      if (location[0].location_trigger === 'Location Entry') return;

      // Track the visit for location
      trackVisit(projectId.toString(), locationId, username, location[0].score_points)
        .then(() => {
          setVisitedLocationIds(prevVisited => new Set(prevVisited).add(location[0].id));
        })
    }
    catch (error) {
      console.error("Error tracking visit:", error);
    }
  };

  // Display Scanner
  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {/* Display scanned data. */}
      {scanned && (
        <View style={styles.scanResultContainer}>
          <Text style={styles.scanResultText}>Location: {locationName}</Text>
        </View>
      )}
    </View>
  );
}

// Styles for QR Scanner component
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  scanResultContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 15 },
  scanResultText: { fontSize: 16, marginBottom: 10 },
});
