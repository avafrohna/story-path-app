import { Project, ProjectCount } from '@/types/types';
import { useUser } from '../components/usercontext';
import { useEffect, useState } from 'react';
import { getProjects, getProjectCount } from '../api';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProjectDetailsTabs from '@/components/project/projectdetailstabs';
import { useRouter } from 'expo-router';

export default function Projects() {
  const router = useRouter();
  const { username } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participantCounts, setParticipantCounts] = useState<{ [key: string]: number }>({});
  const [selectedProjectId, setSelectedProjectId] = useState<number>();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const projectsData: Project[] = await getProjects();
        const publishedProjects = projectsData.filter((project) => project.is_published);

        setProjects(publishedProjects);
        setLoading(false);

        fetchParticipantCounts(publishedProjects);
      } 
      catch (err) {
        setError(`Error fetching projects: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    const fetchParticipantCounts = async (projects: Project[]) => {
      const counts: { [key: string]: number } = {};
    
      await Promise.all(
        projects.map(async (project) => {
          const count = await getProjectCount(project.id) as ProjectCount[];
    
          if (count.length > 0) {
            counts[project.id] = count[0].number_participants;
          } 
          else {
            counts[project.id] = 0;
          }
        })
      );

      setParticipantCounts(counts);
    };

    fetchProjects();

    return () => setSelectedProjectId(undefined);
  }, []);

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

  const renderItem = ({ item }: { item: Project }) => (
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
              renderItem={renderItem}
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
