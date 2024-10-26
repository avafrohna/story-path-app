import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getProject } from '../../api';
import { useRouter } from 'expo-router';

type Project = {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  instructions: string;
  initial_clue: string;
  participant_scoring: string;
  homescreen_display: string;
};

type ProjectDetailsProps = {
  projectId: string;
};

export default function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await getProject(projectId) as Project[];
        setProject(projectData[0]);
        setLoading(false);
      } 
      catch (err) {
        setError(`Error fetching project details: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.title || 'No Title'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.description}>
          {project.description || 'No Description Available.'}
        </Text>
        <Text style={styles.sectionTitle}>Initial Clue</Text>
        <Text style={styles.clue}>
          {project.initial_clue || 'No Initial Clue Provided.'}
        </Text>
        <View style={styles.pointsContainer}>
          <View style={styles.pointsBox}>
            <Text style={styles.pointsTitle}>Points</Text>
            <Text style={styles.pointsValue}>{'0'} / 20</Text>
          </View>
          <View style={styles.pointsBox}>
            <Text style={styles.pointsTitle}>Locations Visited</Text>
            <Text style={styles.pointsValue}>{'0'} / 3</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    backgroundColor: '#81A6C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  clue: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pointsBox: {
    backgroundColor: '#81A6C7',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pointsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsValue: {
    color: '#fff',
    fontSize: 20,
    marginTop: 4,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#81A6C7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
