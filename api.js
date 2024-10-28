const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ5MDA1MzQifQ.7GTR79tbb2Nk1o2mZKdpBqpbuHScsUhEFws7hMkYLvA';
const USERNAME = 's4900534';

/**
 * Helper function to make API requests.
 * It automatically includes the Authorization header and any request body.
 *
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH, etc.).
 * @param {object} [body=null] - The request body to send (for POST/PATCH requests).
 * @returns {Promise<object>} - The JSON response from the API.
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JWT_TOKEN}`,
    },
  };

  if (method === 'POST' || method === 'PATCH') {
    options.headers['Prefer'] = 'return=representation';
  }

  if (body) {
    const requestBody = { 
      ...body, 
      username: USERNAME
    };
    options.body = JSON.stringify(requestBody);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    console.error(`Error response: ${await response.text()}`); // Log error details
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }

  return response.json(); 
}

/**
 * Fetch all projects.
 * @returns {Promise<Array>} - Returns an array of project objects.
 */
export async function getProjects() {
  try {
    const response = await apiRequest('/project');
    return response;
  } 
  catch (error) {
    console.error("Error in getProjects: ", error);
  }
}

/**
 * Fetch a single project by ID.
 * @param {string} id - The project ID.
 * @returns {Promise<object>} - Returns a single project object.
 */
export async function getProject(id) {
  return await apiRequest(`/project?id=eq.${id}`);
}

/**
 * Fetch all locations.
 * @returns {Promise<Array>} - Returns an array of project objects.
 */
export async function getLocations() {
  try {
    const response = await apiRequest('/location');
    return response;
  }
  catch (error) {
    console.error("Error in getLocations: ", error);
  }
}

/**
 * Fetch a single location by ID.
 * @param {string} id - The location ID.
 * @returns {Promise<object>} - Returns a single location object.
 */
export async function getLocation(id) {
  return await apiRequest(`/location?id=eq.${id}`);
}


/**
 * Fetch participant count for a specific project by project_id.
 * @param {string} projectId - The project ID.
 * @returns {Promise<number>} - The number of unique participants.
 */
export async function getProjectParticipantCount(projectId) {
  try {
    const response = await apiRequest(`/project_participant_counts?project_id=eq.${projectId}`);
    return response.length > 0 ? response[0].number_participants : 0;
  } catch (error) {
    console.error("Error in getProjectParticipantCount: ", error);
    return 0; // Return 0 if there's an error
  }
}

/**
 * Track a participant's visit to a location.
 * @param {string} projectId - The ID of the project.
 * @param {string} locationId - The ID of the location.
 * @param {string} participantUsername - The participant's username.
 * @param {number} points - The number of points earned for this visit.
 * @returns {Promise<object>} - The response from the tracking endpoint.
 */
export async function trackVisit(projectId, locationId, participantUsername, points = 0) {
  try {
    const response = await apiRequest('/tracking', 'POST', {
      project_id: projectId,
      location_id: locationId,
      participant_username: participantUsername,
      points: points,
    });
    return response;
  } catch (error) {
    console.error("Error in trackVisit: ", error);
    throw error;
  }
}
