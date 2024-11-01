import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useUser } from '../usercontext';
import { trackVisit, getLocation, getUserTrackingEntries } from '../../api';
import { Location, ProjectID } from '@/types/types';

export default function QRCodeScanner({ projectId }: ProjectID) {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());
  const [locationName, setLocationName] = useState('');
  const { username } = useUser();

  useEffect(() => {
    const fetchTrackingEntries = async () => {
      if (!username) return;

      try {
        const trackingEntries = (await getUserTrackingEntries(projectId, username)) as { location_id: number }[];
        const visitedIds = new Set(trackingEntries.map(entry => entry.location_id));
        setVisitedLocationIds(visitedIds);
      }
      catch (error) {
        console.error("Error fetching tracking entries:", error);
      }
    };

    fetchTrackingEntries();
  }, [projectId, username]);

  if (!permission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    
    const match = data.match(/\/location\/(\d+)/);
    if (match && match[1]) {
      const locationId = match[1];
      const location = await getLocation(locationId) as Location[];

      setLocationName(location[0].location_name);

      if (!username) return;
      if (visitedLocationIds.has(location[0].id)) return;

      trackVisit(projectId.toString(), locationId, username, location[0].score_points)
        .then(() => {
          setVisitedLocationIds(prevVisited => new Set(prevVisited).add(location[0].id));
        })
        .catch(error => console.error("Error tracking visit:", error));
    } 
    else {
      console.error("Invalid QR Code", "This QR code is not valid for location tracking.");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <View style={styles.scanResultContainer}>
          <Text style={styles.scanResultText}>Location: {locationName}</Text>
          <Button 
            title="Tap to Scan Again" 
            onPress={() => {
              setTimeout(() => setScanned(false), 200);
            }} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  scanResultContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 15 },
  scanResultText: { fontSize: 16, marginBottom: 10 },
});
