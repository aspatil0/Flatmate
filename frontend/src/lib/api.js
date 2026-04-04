// API configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const formDataCall = async (endpoint, formData, token = null) => {
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
};

// Auth API calls
export const authAPI = {
  register: (name, email, password) =>
    apiCall('/auth/register', 'POST', { name, email, password }),

  login: (email, password) =>
    apiCall('/auth/login', 'POST', { email, password }),

  getProfile: (token) =>
    apiCall('/auth/profile', 'GET', null, token),

  updateProfile: (profileData, token) =>
    apiCall('/auth/profile', 'PUT', profileData, token),
};

// Posts API calls
export const postsAPI = {
  getPosts: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.minRent) params.append('minRent', filters.minRent);
    if (filters.maxRent) params.append('maxRent', filters.maxRent);
    if (filters.roomType) params.append('roomType', filters.roomType);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = queryString ? `/posts?${queryString}` : '/posts';
    return apiCall(url, 'GET');
  },

  getPostById: (postId) =>
    apiCall(`/posts/${postId}`, 'GET'),

  createPost: (postData, token) =>
    apiCall('/posts', 'POST', postData, token),

  updatePost: (postId, postData, token) =>
    apiCall(`/posts/${postId}`, 'PUT', postData, token),

  deletePost: (postId, token) =>
    apiCall(`/posts/${postId}`, 'DELETE', null, token),

  getUserPosts: (token) =>
    apiCall('/posts/user/my-posts', 'GET', null, token),

  addInterested: (postId, token) =>
    apiCall(`/posts/${postId}/interested`, 'POST', {}, token),

  createBookingRequest: (postId, token) =>
    apiCall(`/posts/${postId}/book`, 'POST', {}, token),

  getBookingRequests: (token) =>
    apiCall('/posts/owner/bookings', 'GET', null, token),

  respondToBookingRequest: (postId, bookingRequestIndex, status, token) =>
    apiCall(`/posts/${postId}/booking-response`, 'PUT', { bookingRequestIndex, status }, token),

  // Number request APIs
  requestContactNumber: (postId, token) =>
    apiCall(`/posts/${postId}/request-number`, 'POST', {}, token),

  getNumberRequests: (token) =>
    apiCall('/posts/owner/number-requests', 'GET', null, token),

  respondToNumberRequest: (requestId, status, token) =>
    apiCall(`/posts/number-request/${requestId}/respond`, 'PUT', { status }, token),

  checkNumberAccess: (postId, token) =>
    apiCall(`/posts/${postId}/check-number-access`, 'GET', null, token),
};

export const chatAPI = {
  getConversations: (token) =>
    apiCall('/chats', 'GET', null, token),

  startConversation: (payload, token) =>
    apiCall('/chats/start', 'POST', payload, token),

  getMessages: (conversationId, token) =>
    apiCall(`/chats/${conversationId}/messages`, 'GET', null, token),

  sendMessage: (conversationId, text, token) =>
    apiCall(`/chats/${conversationId}/messages`, 'POST', { text }, token),
};

export const uploadAPI = {
  uploadImage: (file, token) => {
    const formData = new FormData();
    formData.append('image', file);
    return formDataCall('/upload', formData, token);
  },
};
