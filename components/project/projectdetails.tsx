import { useUser } from '../usercontext';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Location, Project, LocationCount, ProjectID } from '@/types/types';
import { getProject, getLocations, getUserTrackingEntries, getLocationCount } from '../../api';
import React, { useState, useCallback } from 'react';

/**
 * ProjectDetails component displays details for a specific project.
 * Shows project instructions, locations, participant visit counts, and a scoring summary.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {number} props.projectId - Unique identifier for the project.
 * @returns {JSX.Element} The project details view with location information and scoring.
 */
export default function ProjectDetails({ projectId }: ProjectID) {
  const { username } = useUser();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState<Project | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());
  const [participantCounts, setParticipantCounts] = useState<{ [locationId: string]: number }>({});

  const [totalScore, setTotalScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  // Reset visited locations when coming back to page
  useFocusEffect(
    useCallback(() => {
      fetchProjectData();
      return () => setVisitedLocationIds(new Set());
    }, [projectId])
  );

  /**
   * Fetches project data, locations, and participant counts.
   * Sets loading and error states based on the success of each API call.
   */
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch project data
      const projectData = await getProject(projectId.toString()) as Project[];
      setProject(projectData[0]);

      // Fetch locations in project
      const locationsData = await getLocations() as Location[];
      const projectLocations = locationsData.filter((location) => location.project_id === projectId);
      setLocations(projectLocations);

      // Fetch scoring if necessary
      calculateTotalScore(projectData[0], projectLocations);
      // Fetch visited locations
      await fetchVisitedLocations(projectLocations);
      await fetchCountsLocations(projectLocations);

      setLoading(false);
    }
    catch (err) {
      setError(`Error fetching projects: ${(err as Error).message}`);
      setLoading(false);
    }
  };

  /**
   * Calculates the total score for all locations in the project.
   *
   * @param {Project} project - The current project.
   * @param {Location[]} projectLocations - Array of locations associated with the project.
   */
  const calculateTotalScore = (project: Project, projectLocations: Location[]) => {
    // If scoring is not 'Not Scored' set total score
    if (project.participant_scoring !== 'Not Scored') {
      const total = projectLocations.reduce((acc, loc) => acc + loc.score_points, 0);
      setTotalScore(total);
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
      setVisitedLocationIds(visitedIds);
      setCurrentScore(visitedLocations.reduce((acc, location) => acc + location.score_points, 0));
    } 
    catch (error) {
      console.error("Error fetching visited locations:", error);
      setError('Error fetching visited locations.');
    }
  };

  /**
   * Fetches the participant counts for each location in the project.
   *
   * @param {Location[]} locations - Array of locations for which to fetch participant counts.
   */
  const fetchCountsLocations = async (locations: Location[]) => {
    const counts: { [key: string]: number } = {};

    try {
      await Promise.all(
        // Loop through locations
        locations.map(async (location) => {
          // Get number of participants for each location
          const count = await getLocationCount(location.id) as LocationCount[];
          counts[location.id] = count.length > 0 ? count[0].number_participants : 0;
        })
      );
      setParticipantCounts(counts);
    }
    catch (error) {
      console.error('Error fetching count for location: ', error);
      setError('Error fetching count for locations.');
    }
  };

  if (!project) {
    return <Text style={styles.error}>Project not found</Text>;
  }

  // Display project homepage
  return (
    <ScrollView style={styles.container}>
      {/* Display loading. */}
      {loading ? (
        <ActivityIndicator size="large" color="#81A6C7" style={styles.loading} />
      ) : error ? (
        // Display error message
        <Text style={styles.error}>{error}</Text>
      ) : project ? (
        // Porject details displayed 
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{project.title || 'No Title'}</Text>
          </View>
  
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.description}>
              {project.instructions || 'No Instructions Available.'}
            </Text>
  
            {/* Display clue or locations depending on homescreen_display. */}
            {project.homescreen_display === 'Display all locations' ? (
              <>
                <Text style={styles.sectionTitle}>Locations</Text>
                {locations.length > 0 ? (
                  locations.map((location, index) => (
                    <Text key={index} style={styles.locationItem}>{location.location_name}</Text>
                  ))
                ) : (
                  <Text style={styles.error}>No locations have been added.</Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Initial Clue</Text>
                <Text style={styles.clue}>
                  {project.initial_clue || 'No Initial Clue Provided.'}
                </Text>
              </>
            )}
  
            {/* Display visited locations and scoring. */}
            {project.participant_scoring !== 'Not Scored' ? (
              <View style={styles.pointsContainer}>
                <View style={styles.pointsBox}>
                  <Text style={styles.pointsTitle}>Points</Text>
                  <Text style={styles.pointsValue}>{currentScore} / {totalScore}</Text>
                </View>
                <View style={styles.pointsBox}>
                  <Text style={styles.pointsTitle}>Locations Visited</Text>
                  <Text style={styles.pointsValue}>{visitedLocationIds.size} / {locations.length}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.pointsContainer}>
                <View style={styles.pointsBox}>
                  <Text style={styles.pointsTitle}>Locations Visited</Text>
                  <Text style={styles.pointsValue}>{visitedLocationIds.size} / {locations.length}</Text>
                </View>
              </View>
            )}
          </View>
  
          {/* Display list of locations. */}
          <View style={styles.locationsList}>
            <Text style={styles.locationListTitle}>Locations in Project</Text>
            {locations.length > 0 ? (
              locations.map((location) => (
                <View key={location.id} style={styles.locationCard}>
                  <Text style={styles.locationTitle}>{location.location_name}</Text>
                  {/* Display clue if present. */}
                  {location.clue && (
                    <Text style={styles.clueText}>Clue: {location.clue}</Text>
                  )}
                  {/* Render html content. */}
                  <WebView
                    style={styles.webView}
                    originWhitelist={['*']}
                    source={{ html: location.location_content }}
                    javaScriptEnabled={true}
                  />
                  {/* Display project participant count. */}
                  <Text style={styles.participantCount}>
                    Participants Visited: {participantCounts[location.id]}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.error}>No locations available for this project.</Text>
            )}
          </View>
        </>
      ) : (
        <Text style={styles.error}>Project not found</Text>
      )}
    </ScrollView>
  );
}

// Styles for ProjectDetails component
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#81A6C7', padding: 16, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 14, color: '#666', marginBottom: 16 },
  clue: { fontStyle: 'italic', color: '#888', marginBottom: 16 },
  pointsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  pointsBox: { backgroundColor: '#81A6C7', borderRadius: 8, padding: 16, flex: 1, alignItems: 'center', marginHorizontal: 4 },
  pointsTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pointsValue: { color: '#fff', fontSize: 20, marginTop: 4 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  locationsList: { marginTop: 20 },
  locationListTitle: { fontSize: 22, fontWeight: 'bold', color: '#81A6C7', marginBottom: 8 },
  locationItem: { fontSize: 16, marginVertical: 4, color: '#555' },
  locationCard: { backgroundColor: '#B0CBE9', borderRadius: 8, padding: 16, marginBottom: 10 },
  locationTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  participantCount: { fontSize: 14, color: '#fff' },
  webView: { height: 30, marginVertical: 10, borderRadius: 2 },
  clueText: { fontSize: 14, color: '#fff', marginBottom: 2, marginTop: 4 },
});
