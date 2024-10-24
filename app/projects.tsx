import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getProjects } from '../api';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Stack } from 'expo-router';
import ProjectDetails from '../components/project/projectdetails';

type Project = {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
  is_published: boolean;
  instructions: string;
  initial_clue: string;
  participant_scoring: string,
  homescreen_display: string,
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData: Project[] = await getProjects();
        const publishedProjects = projectsData.filter((project) => project.is_published);
        setProjects(publishedProjects);
        setLoading(false);
      } 
      catch (err) {
        setError(`Error fetching projects: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);
  
  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectContainer}
      activeOpacity={0.8}
      onPress={() => setSelectedProjectId(item.id)}
    >
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <View style={styles.participantBadge}>
          <Text style={styles.participantBadgeText}>
            Participants: {item.participantsCount}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#81A6C7" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Projects' }} />
      {selectedProjectId ? (
        <ProjectDetails projectId={selectedProjectId} />
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#81A6C7',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  projectContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  participantBadge: {
    backgroundColor: '#81A6C7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  participantBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noProjectsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});