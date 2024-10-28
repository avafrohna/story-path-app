import React, { useEffect, useState } from 'react';
import MapView, { Circle } from 'react-native-maps';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { getLocations } from '../../api';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Location = {
  id: string;
  project_id: string;
  location_name: string;
  location_content: string;
  clue: string;
  score_points: number;
  location_trigger: string;
  location_position: string;
};

type MapScreenProps = {
  projectId: string;
};

export default function MapScreen({ projectId }: MapScreenProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [region, setRegion] = useState<Region>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const allLocations = await getLocations();
        const projectLocations = allLocations.filter(
          (location: Location) => location.project_id === projectId
        );
        setLocations(projectLocations);

        if (projectLocations.length > 0) {
          const [latitude, longitude] = projectLocations[0].location_position
            .replace(/[()]/g, '')
            .split(',')
            .map(Number);
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
        setLoading(false);
      } 
      catch (error) {
        Alert.alert('Error', 'Failed to fetch locations.');
        setLoading(false);
      }
    };

    fetchLocations();
  }, [projectId]);

  const parseCoordinates = (position: string) => {
    const [latitude, longitude] = position.replace(/[()]/g, '').split(',').map(Number);
    return { latitude, longitude };
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#81A6C7" />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {locations.map((location) => {
          const { latitude, longitude } = parseCoordinates(location.location_position);
          return (
            <Circle
              key={location.id}
              center={{ latitude, longitude }}
              radius={4000}
              strokeColor="rgba(0, 112, 255, 2)"
              fillColor="rgba(0, 112, 255, 0.2)" 
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
