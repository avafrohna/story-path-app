import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { getProject, getLocations, getUserTrackingEntries, getLocationCount } from '../../api';
import RenderHtml from 'react-native-render-html';
import { useUser } from '../usercontext';
import { Location, Project, LocationCount, ProjectID } from '@/types/types';
import { useFocusEffect } from '@react-navigation/native';

export default function ProjectDetails({ projectId }: ProjectID) {
  const [project, setProject] = useState<Project | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participantCounts, setParticipantCounts] = useState<{ [locationId: string]: number }>({});
  const [currentScore, setCurrentScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const { width } = useWindowDimensions();
  const { username } = useUser();
  const [visitedLocations, setVisitedLocations] = useState<Location[]>([]);
  const [visitedLocationIds, setVisitedLocationIds] = useState(new Set<number>());

  useFocusEffect(
    useCallback(() => {
      const fetchProjectData = async () => {
        try {
          setLoading(true);

          const projectData = await getProject(projectId.toString()) as Project[];
          setProject(projectData[0]);

          const locationsData = await getLocations() as Location[];
          const projectLocations = locationsData.filter((location) => location.project_id === projectId);
          setLocations(projectLocations);

          if (projectData[0].participant_scoring !== 'Not Scored') {
            const score = projectLocations.reduce((acc, loc) => acc + loc.score_points, 0);
            setTotalScore(score);
          }

          const trackingEntries = (await getUserTrackingEntries(projectId, username)) as { location_id: number }[];
          const visitedIds = new Set(trackingEntries.map(entry => entry.location_id));
          const visitedLocations = projectLocations.filter(location => visitedIds.has(location.id));

          setVisitedLocations(visitedLocations);
          setVisitedLocationIds(visitedIds);

          await fetchVisitCountsForLocations(projectLocations);

          setLoading(false);
        } 
        catch (err) {
          setError(`Error fetching project details: ${(err as Error).message}`);
          setLoading(false);
        }
      };

      if (projectId) {
        fetchProjectData();
      }
    }, [projectId])
  );

  const fetchVisitCountsForLocations = async (locations: Location[]) => {
    const counts: { [locationId: string]: number } = {};

    await Promise.all(
      locations.map(async (location) => {
        const count = await getLocationCount(location.id) as LocationCount[];

        if (count.length > 0) {
          counts[location.id] = count[0].number_participants;
        } 
        else {
          counts[location.id] = 0;
        }
      })
    );

    setParticipantCounts(counts);
  };

  const calculateCurrentScore = () => {
    let score = visitedLocations.reduce((acc, location) => acc + location.score_points, 0);
    setCurrentScore(score);
  };
  
  useEffect(() => {
    calculateCurrentScore();
  }, [visitedLocations]);

  if (loading) {
    return <ActivityIndicator size="large" color="#81A6C7" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!project) {
    return <Text style={styles.error}>Project not found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.title || 'No Title'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.description}>
          {project.instructions || 'No Instructions Available.'}
        </Text>

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

      <View style={styles.locationsList}>
        <Text style={styles.locationListTitle}>Locations in Project</Text>
        {locations.length > 0 ? (
          locations.map((location) => (
            <View key={location.id} style={styles.locationCard}>
              <Text style={styles.locationTitle}>{location.location_name}</Text>
              <RenderHtml
                contentWidth={width}
                source={{ html: location.location_content || '<p>No content available.</p>' }}
                tagsStyles={{
                  p: { color: '#666', fontSize: 14 },
                  strong: { fontWeight: 'bold' }
                }}
              />
              <Text style={styles.participantCount}>
                Participants Visited: {participantCounts[location.id]}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.error}>No locations available for this project.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
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
});
