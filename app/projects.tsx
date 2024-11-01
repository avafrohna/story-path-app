import { useUser } from '../components/usercontext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Project, ProjectCount } from '@/types/types';
import { getProjects, getProjectCount } from '../api';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProjectDetailsTabs from '@/components/project/projectdetailstabs';

/**
 * Projects component displays a list of published projects with participant counts.
 * Users can view project details if logged in; otherwise, they are prompted to log in.
 * Fetches project data and participant counts from centralized API functions.
 *
 * @component
 * @returns {JSX.Element} The projects view, including a list of projects or detailed project view.
 */
export default function Projects() {
  const router = useRouter();
  const { username } = useUser();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const [participantCounts, setParticipantCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchProjects();
    // Reset selected project ID on unmount
    return () => setSelectedProjectId(undefined);
  }, []);

  /**
   * Fetches published projects and their participant counts.
   * Sets loading and error states based on the success of each API call.
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch project and filter by is_published
      const projectsData: Project[] = await getProjects();
      const publishedProjects = projectsData.filter((project) => project.is_published);

      setProjects(publishedProjects);
      setLoading(false);

      // Fetch participant counts for each published project
      fetchParticipantCounts(publishedProjects);
    } 
    catch (err) {
      setError(`Error fetching projects: ${(err as Error).message}`);
      setLoading(false);
    }
  };

  /**
   * Fetches participant counts for a list of projects.
   * Updates the participantCounts state with the count for each project.
   *
   * @param {Project[]} projects - Array of projects to retrieve participant counts for.
   */
  const fetchParticipantCounts = async (projects: Project[]) => {
    const counts: { [key: string]: number } = {};
  
    try {
      await Promise.all(
        // Loop through projects
        projects.map(async (project) => {
          // Get number of participants for each project
          const count = await getProjectCount(project.id) as ProjectCount[];
          counts[project.id] = count.length > 0 ? count[0].number_participants : 0;
        })
      );
      setParticipantCounts(counts);
    }
    catch (error) {
      console.error("Error fetching participant counts:", error);
      setError('Error fetching participant counts.');
    }
  };

  /**
   * Handles project item press events. Prompts login if the user is not authenticated.
   *
   * @param {number} projectId - ID of the selected project.
   */
  const handleProjectPress = (projectId: number) => {
    if (!username) {
      Alert.alert(
        "User Login Required",
        "You must log in or create a profile to view project details.",
        [
          {
            text: "Profile",
            onPress: () => router.push('/profile')
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    } 
    else {
      setSelectedProjectId(projectId);
    }
  };

  /**
   * Renders a single project item in the FlatList.
   *
   * @param {object} item - The project item to render.
   * @returns {JSX.Element} TouchableOpacity element with project details and participant count.
   */
  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectContainer}
      activeOpacity={0.8}
      onPress={() => handleProjectPress(item.id)}
    >
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <View style={styles.participantBadge}>
          <Text style={styles.participantBadgeText}>
            Participants: {participantCounts[item.id] || 0}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#81A6C7" />
    </TouchableOpacity>
  );

  // Display project page
  return (
    <View style={styles.container}>
      {selectedProjectId ? (
        <ProjectDetailsTabs projectId={selectedProjectId} />
      ) : (
        <>
          <Text style={styles.title}>Published Projects</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#81A6C7" />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : projects.length > 0 ? (
            <FlatList
              data={projects}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProject}
              contentContainerStyle={styles.list}
            />
          ) : (
            <Text style={styles.noProjectsText}>No published projects available.</Text>
          )}
        </>
      )}
    </View>
  );
}

// Styles for the Projects component
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#81A6C7', marginBottom: 20, textAlign: 'center' },
  list: { paddingBottom: 20 },
  projectContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  projectInfo: { flexDirection: 'row', alignItems: 'center' },
  projectTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginRight: 10 },
  participantBadge: { backgroundColor: '#81A6C7', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  participantBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  noProjectsText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
});
