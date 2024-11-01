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

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

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

export type ProjectCount = {
  project_id: number;
  number_participants: number;
}

export type LocationCount = {
  project_id: number;
  location_id: number;
  number_participants: number;
}