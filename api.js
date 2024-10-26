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
