import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function QRCodeScanner() {
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

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

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setScannedData(data);
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
      </CameraView>
      {scanned && (
        <View style={styles.scanResultContainer}>
          <Text style={styles.scanResultText}>Scanned data: {scannedData}</Text>
          <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
  },
  scanResultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
  },
  scanResultText: {
    fontSize: 16,
    marginBottom: 10,
  },
});
