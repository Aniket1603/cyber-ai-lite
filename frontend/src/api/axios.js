import axios from 'axios'

// 🔥 Direct deployed backend URL
const api = axios.create({
  // Use environment variable VITE_API_BASE_URL if available, otherwise fallback to local
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 30000,
})

// ✅ Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cybereye_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cybereye_token')
      localStorage.removeItem('cybereye_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api