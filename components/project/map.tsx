import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { getLocations, getUserTrackingEntries, trackVisit } from '../../api';
import { useUser } from '../usercontext';
import MapView, { Circle, UserLocationChangeEvent } from 'react-native-maps';
import { Location, Region, Project } from '@/types/types';

type MapScreenProps = {
  projectId: string;
};

export default function MapScreen({ projectId }: MapScreenProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<Location[]>([]);
  const [region, setRegion] = useState<Region>();
  const [loading, setLoading] = useState(true);
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());
  const { username } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const allLocations = await getLocations();
        console.log("All locations fetched:", allLocations);

        const projectLocations = allLocations.filter(
          (location: Location) => location.project_id === projectId
        );
        console.log("Project-specific locations:", projectLocations);

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

        const trackingEntries = (await getUserTrackingEntries(projectId, username)) as { location_id: number }[];
        console.log("User-specific tracking entries:", trackingEntries);

        const visitedIds = new Set(trackingEntries.map(entry => entry.location_id));
        console.log("Visited location IDs:", Array.from(visitedIds));

        const visitedLocations = projectLocations.filter(location => visitedIds.has(location.id));
        console.log("Filtered visited locations:", visitedLocations);

        setLocations(projectLocations);
        setVisitedLocations(visitedLocations);
        setVisitedLocationIds(visitedIds);
        setLoading(false);
      } 
      catch (error) {
        Alert.alert('Error', 'Failed to fetch data.');
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, username]);

  const parseCoordinates = (position: string) => {
    const [latitude, longitude] = position.replace(/[()]/g, '').split(',').map(Number);
    return { latitude, longitude };
  };

  const handleUserLocationChange = (event: UserLocationChangeEvent) => {
    const coordinate = event.nativeEvent.coordinate;
  
    if (coordinate) {
      const userLatitude = coordinate.latitude;
      const userLongitude = coordinate.longitude;
  
      locations.forEach(location => {
        const { latitude, longitude } = parseCoordinates(location.location_position);
        const distance = getDistance(userLatitude, userLongitude, latitude, longitude);
  
        if (distance < 4000 && !visitedLocationIds.has(location.id)) {
          trackVisit(projectId, location.id.toString(), username ?? '', location.score_points)
            .then(() => {
              setVisitedLocationIds(prevVisited => new Set(prevVisited).add(location.id));
              setVisitedLocations(prev => [...prev, location]);
            })
            .catch(error => console.error("Error tracking visit:", error));
        }
      });
    } else {
      console.warn("User location coordinate is undefined.");
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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
        onUserLocationChange={handleUserLocationChange}
      >
        {visitedLocations.map((location) => {
          const { latitude, longitude } = parseCoordinates(location.location_position);
          console.log("Rendering visited location on map:", location.id, location.location_name);
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
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});
