import { useUser } from '../usercontext';
import { useFocusEffect } from '@react-navigation/native';
import { Location, Region, ProjectID, Project } from '@/types/types';
import { Text, StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { getLocations, getUserTrackingEntries, trackVisit, getProject } from '../../api';
import React, { useState, useCallback } from 'react';
import MapView, { Circle, UserLocationChangeEvent } from 'react-native-maps';

/**
 * MapScreen component displays a map with project-specific locations,
 * marking visited locations and tracking new visits based on user proximity.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {number} props.projectId - ID of the project being displayed.
 * @returns {JSX.Element} The map view with location tracking capabilities.
 */
export default function MapScreen({ projectId }: ProjectID) {
  const { username } = useUser();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [region, setRegion] = useState<Region>();
  const [project, setProject] = useState<Project>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<Location[]>([]);
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());

  // Reset visited locations when coming back to page
  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => setVisitedLocationIds(new Set());
    }, [projectId, username])
  );

  /**
   * Fetches project data, locations, and user tracking entries.
   * Sets initial region and updates visited location states.
   */
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch project data
      const projectData = await getProject(projectId.toString()) as Project[];
      setProject(projectData[0]);

      // Fetch locations in project
      const locationsData = await getLocations() as Location[];
      const projectLocations = locationsData.filter((location) => location.project_id === projectId);
      setLocations(projectLocations);

      // Parse coordinates from location_position
      if (projectLocations.length > 0) {
        const { latitude, longitude } = parseCoordinates(projectLocations[0].location_position);
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }

      // Fetch visited locations
      await fetchVisitedLocations(projectLocations);
      setLoading(false);
    }
    catch (err) {
      setError(`Error fetching projects: ${(err as Error).message}`);
      setLoading(false);
    }
  };

  /**
   * Fetches user tracking entries to determine visited locations and calculates current score.
   *
   * @param {Location[]} projectLocations - Array of project locations.
   */
  const fetchVisitedLocations = async (projectLocations: Location[]) => {
    try {
      // Fetch all tracking entries for user
      const trackingEntries = (await getUserTrackingEntries(projectId, username)) as { location_id: number }[];
      // Select id's for all visited location from tracking entries
      const visitedIds = new Set(trackingEntries.map(entry => entry.location_id));
      // Filter visited locations
      const visitedLocations = projectLocations.filter(location => visitedIds.has(location.id));

      // Set all data
      setVisitedLocations(visitedLocations);
      setVisitedLocationIds(visitedIds);
    } 
    catch (error) {
      console.error("Error fetching visited locations:", error);
      setError('Error fetching visited locations.');
    }
  };

  /**
   * Parses coordinates from a position string and returns a latitude/longitude object.
   *
   * @param {string} position - Position string in the format "(latitude, longitude)".
   * @returns {{ latitude: number, longitude: number }} Parsed latitude and longitude.
   */
  const parseCoordinates = (position: string) => {
    const [latitude, longitude] = position.replace(/[()]/g, '').split(',').map(Number);
    return { latitude, longitude };
  };

  /**
   * Handles user location change events and checks proximity to project locations.
   * Tracks visits to new locations if within a specified radius.
   *
   * @param {UserLocationChangeEvent} event - Event object containing user's new location coordinates.
   */
  const handleUserLocationChange = useCallback((event: UserLocationChangeEvent) => {
    const coordinate = event.nativeEvent.coordinate;

    if (!coordinate) {
      console.warn("User location coordinate is undefined.");
      return;
    }

    const userLatitude = coordinate.latitude;
    const userLongitude = coordinate.longitude;

    locations.forEach(location => {
      // Skip locations with QR code-only triggers
      if (location.location_trigger === 'QR Code Scans') return;

      const { latitude, longitude } = parseCoordinates(location.location_position);
      const distance = getDistance(userLatitude, userLongitude, latitude, longitude);

      // If current location within 100 meters of coordinates and not yet visited
      if (distance < 100 && !visitedLocationIds.has(location.id)) {
        // If no username display alert
        if (!username) {
          Alert.alert(
            "User Login Required",
            "You must log in or create a profile to track project details.",
            [{ text: "Cancel", style: "cancel" }],
            { cancelable: true }
          );
        }
        else {
          // Track visit for location
          trackVisit(projectId.toString(), location.id.toString(), username, location.score_points)
            .then(() => {
              setVisitedLocationIds(prevVisited => new Set(prevVisited).add(location.id));
              setVisitedLocations(prev => [...prev, location]);
            })
            .catch(error => console.error("Error tracking visit:", error));
        }
      }
    });
  }, [locations, visitedLocationIds]);

  /**
   * Calculates the distance between two geographical points using the Haversine formula.
   *
   * @param {number} lat1 - Latitude of the first point.
   * @param {number} lon1 - Longitude of the first point.
   * @param {number} lat2 - Latitude of the second point.
   * @param {number} lon2 - Longitude of the second point.
   * @returns {number} The distance in meters between the two points.
   */
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

  // Display project map
  return (
    <View style={styles.container}>
      {loading ? (
        // Display activity symbol
        <ActivityIndicator size="large" color="#81A6C7" style={styles.loading} />
      ) : error ? (
        // Display error message
        <Text style={styles.error}>{error}</Text>
      ) : (
        // Display map
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          onUserLocationChange={handleUserLocationChange}
        >
          {/* Depending on homescreen_display, display all locations or just visted ones. */}
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
        )}
    </View>
  );
}

// Styles for Map component
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 20, fontSize: 16 },
});
