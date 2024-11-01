export type Location = {
  id: number;
  project_id: string;
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
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  instructions: string;
  initial_clue: string;
  participant_scoring: string;
  homescreen_display: string;
};

export type Count = {
  project_id: string;
  number_participants: string;
}