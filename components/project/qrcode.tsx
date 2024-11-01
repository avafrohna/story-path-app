import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useUser } from '../usercontext';
import { trackVisit, getLocation, getUserTrackingEntries } from '../../api';
import { useNavigation } from '@react-navigation/native';
import { Location } from '@/types/types';

type QRScreenProps = {
  projectId: string;
};

export default function QRCodeScanner({ projectId }: QRScreenProps) {
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());
  const [locationName, setLocationName] = useState('');
  const { username } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTrackingEntries = async () => {
      if (!username) return;

      try {
        const trackingEntries = (await getUserTrackingEntries(projectId, username)) as { location_id: number }[];
        const visitedIds = new Set(trackingEntries.map(entry => entry.location_id));
        setVisitedLocationIds(visitedIds);
      }
      catch (error) {
        Alert.alert("Error", "Failed to fetch tracking data.");
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
    setScannedData(data);
    
    const match = data.match(/\/location\/(\d+)/);
    if (match && match[1]) {
      const locationId = match[1];
      const location = await getLocation(locationId) as Location[];

      setLocationName(location[0].location_name);

      if (visitedLocationIds.has(location[0].id)) {
        console.log("Did not track");
        return;
      }
      if (username) {
        trackVisit(projectId, locationId, username, location[0].score_points)
          .then(() => {
            setVisitedLocationIds(prevVisited => new Set(prevVisited).add(location[0].id));
          })
          .catch(error => console.error("Error tracking visit:", error));
      } 
      else {
        Alert.alert(
          "User Login Required",
          "You must log in or create a profile to track project details.",
          [
            { text: "Cancel", style: "cancel" },
          ],
          { cancelable: true }
        );
      }
    } 
    else {
      Alert.alert("Invalid QR Code", "This QR code is not valid for location tracking.");
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
