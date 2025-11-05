import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  signup: (data: { email: string; username: string; password: string; displayName?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
}

// Streams APIs
export const streamsApi = {
  create: (data: { title: string; description?: string }) =>
    api.post('/streams', data),
  getLive: (params?: { limit?: number; offset?: number }) =>
    api.get('/streams/live', { params }),
  getById: (id: string) =>
    api.get(`/streams/${id}`),
  end: (id: string) =>
    api.put(`/streams/${id}/end`),
  getByUser: (userId: string) =>
    api.get(`/streams/user/${userId}`),
}

// Users APIs
export const usersApi = {
  getMe: () =>
    api.get('/users/me'),
  getById: (id: string) =>
    api.get(`/users/${id}`),
  update: (data: { displayName?: string; bio?: string; avatar?: string }) =>
    api.put('/users/me', data),
  follow: (userId: string) =>
    api.post(`/users/${userId}/follow`),
  unfollow: (userId: string) =>
    api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: string) =>
    api.get(`/users/${userId}/followers`),
  getFollowing: (userId: string) =>
    api.get(`/users/${userId}/following`),
}

// Notifications APIs
export const notificationsApi = {
  getAll: () =>
    api.get('/notifications'),
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
}
