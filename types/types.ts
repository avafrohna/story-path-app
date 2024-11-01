/**
 * Project type defines the structure for a project in the app.
 */
export type Project = {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  instructions: string;
  initial_clue: string;
  participant_scoring: string;
  homescreen_display: string;
};

/**
 * Location type defines the structure for a location associated with a project.
 */
export type Location = {
  id: number;
  project_id: number;
  location_name: string;
  location_content: string;
  clue: string;
  score_points: number;
  location_trigger: string;
  location_position: string;
};

/**
 * ProjectID type provides a structure for identifying a project by its ID.
 */
export type ProjectID = {
  projectId: number;
}

/**
 * Region type defines the structure for a map region.
 * Used for specifying map area view with latitude, longitude, and delta values.
 */
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/**
 * ProjectCount type provides structure for tracking the number of participants in a project.
 */
export type ProjectCount = {
  project_id: number;
  number_participants: number;
}

/**
 * LocationCount type provides structure for tracking the number of participants at a specific location.
 */
export type LocationCount = {
  project_id: number;
  location_id: number;
  number_participants: number;
}
