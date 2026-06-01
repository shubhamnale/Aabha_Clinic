import axios from 'axios'

const isBrowser = typeof window !== 'undefined'
const isLocalHost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname)

// Use a stable local backend URL to avoid accidental HTTPS upgrades on localhost.
const apiBaseURL = 'https://aabha-clinic.onrender.com/api'
const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('hms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, err => Promise.reject(err))

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hms_token')
      localStorage.removeItem('hms_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: data => api.post('/auth/login', data),
  me:    ()   => api.get('/auth/me'),
}

export const usersAPI = {
  getAll:        ()         => api.get('/users'),
  create:        data       => api.post('/users', data),
  update:        (id, data) => api.put(`/users/${id}`, data),
  delete:        id         => api.delete(`/users/${id}`),
  getProfile:    ()         => api.get('/users/profile'),
  updateProfile: data       => api.put('/users/profile', data),
}

export const doctorsAPI = {
  getAll:  ()         => api.get('/doctors'),
  create:  data       => api.post('/doctors', data),
  update:  (id, data) => api.put(`/doctors/${id}`, data),
  delete:  id         => api.delete(`/doctors/${id}`),
}

export const patientsAPI = {
  getAll:     params    => api.get('/patients', { params }),
  getOne:     id        => api.get(`/patients/${id}`),
  create:     data      => api.post('/patients', data),
  consult:    (id, data)=> api.put(`/patients/${id}/consult`, data),
  billing:    (id, data)=> api.put(`/patients/${id}/billing`, data),
}

export const reportsAPI = {
  summary:           ()     => api.get('/reports/summary'),
  doctorPerformance: ()     => api.get('/reports/doctor-performance'),
  timing:            filter => api.get('/reports/timing', { params: { filter } }),
  dailyPatientReport: date  => api.get('/reports/daily-patient-report', { params: { date } }),
}

export const appointmentsAPI = {
  create: data => api.post('/appointments', data),
}

export default api
