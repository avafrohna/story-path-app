import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { getLocations, getUserTrackingEntries, trackVisit, getProject } from '../../api';
import { useUser } from '../usercontext';
import MapView, { Circle, UserLocationChangeEvent } from 'react-native-maps';
import { Location, Region, ProjectID, Project } from '@/types/types';
import { useFocusEffect } from '@react-navigation/native';

export default function MapScreen({ projectId }: ProjectID) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<Location[]>([]);
  const [region, setRegion] = useState<Region>();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project>();
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());
  const { username } = useUser();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);

          const projectData = await getProject(projectId.toString()) as Project[];
          setProject(projectData[0]);

          const allLocations = await getLocations();
          const projectLocations = allLocations.filter(
            (location: Location) => location.project_id === projectId
          );

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

          const trackingEntries = await getUserTrackingEntries(projectId, username) as { location_id: number }[];
          const visitedIds = new Set(trackingEntries.map(entry => entry.location_id));
          const visitedLocations = projectLocations.filter(location => visitedIds.has(location.id));

          setLocations(projectLocations);
          setVisitedLocations(visitedLocations);
          setVisitedLocationIds(visitedIds);
          setLoading(false);
        } 
        catch (error) {
          setLoading(false);
        }
      };

      fetchData();
    }, [projectId, username])
  );

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
        if (project?.participant_scoring === 'Number of Scanned QR Codes') {
          return;
        }
        if (location.location_trigger === 'QR Code Scans') {
          return;
        }

        const { latitude, longitude } = parseCoordinates(location.location_position);
        const distance = getDistance(userLatitude, userLongitude, latitude, longitude);

        if (distance < 100 && !visitedLocationIds.has(location.id)) {
          if (!username) {
            Alert.alert(
              "User Login Required",
              "You must log in or create a profile to track project details.",
              [{ text: "Cancel", style: "cancel" }],
              { cancelable: true }
            );
          }
          else {
            console.log("Tracking visit for location:", location.id);
            trackVisit(projectId.toString(), location.id.toString(), username, location.score_points)
              .then(() => {
                setVisitedLocationIds(prevVisited => new Set(prevVisited).add(location.id));
                setVisitedLocations(prev => [...prev, location]);
              })
              .catch(error => console.error("Error tracking visit:", error));
          }
        }
      });
    } 
    else {
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
        {(project?.homescreen_display === 'Display all locations' ? locations : visitedLocations).map((location) => {
          const { latitude, longitude } = parseCoordinates(location.location_position);
          return (
            <Circle
              key={`location-${location.id}`}
              center={{ latitude, longitude }}
              radius={100}
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
