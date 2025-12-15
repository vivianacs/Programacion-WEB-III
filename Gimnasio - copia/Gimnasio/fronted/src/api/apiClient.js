import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// CAPTCHA
export const generarCaptcha = () => api.get('/captcha/generar');

// AUTH
export const registroUsuario = (datos) => api.post('/auth/registro', datos);
export const loginUsuario = (datos) => api.post('/auth/login', datos);

// CLIENTES
export const obtenerClientePerfil = () => api.get('/clientes/mi-perfil');
export const obtenerClientes = () => api.get('/clientes');
export const obtenerCliente = (id) => api.get(`/clientes/${id}`);
export const crearCliente = (datos) => api.post('/clientes', datos);
export const actualizarCliente = (id, datos) => api.put(`/clientes/${id}`, datos);
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`);

// INSCRIPCIONES
export const obtenerInscripciones = () => api.get('/inscripciones');
export const obtenerInscripcion = (id) => api.get(`/inscripciones/${id}`);
export const obtenerInscripcionesPorCliente = (clienteId) => api.get(`/inscripciones/cliente/${clienteId}`);
export const crearInscripcion = (datos) => api.post('/inscripciones', datos);
export const actualizarInscripcion = (id, datos) => api.put(`/inscripciones/${id}`, datos);
export const renovarInscripcion = (id) => api.put(`/inscripciones/${id}/renovar`);
export const eliminarInscripcion = (id) => api.delete(`/inscripciones/${id}`);

// PLANES
export const obtenerPlanes = () => api.get('/planes');
export const obtenerPlan = (id) => api.get(`/planes/${id}`);
export const crearPlan = (datos) => api.post('/planes', datos);
export const actualizarPlan = (id, datos) => api.put(`/planes/${id}`, datos);
export const eliminarPlan = (id) => api.delete(`/planes/${id}`);

// REPORTES GIMNASIO
export const descargarReporteInscripcion = (inscripcionId) => api.get(`/reportes/inscripcion/${inscripcionId}`, {
  responseType: 'blob'
});

export const descargarReporteInscritos = (año, mes) => api.get(`/reportes/inscritos/${año}/${mes}`, {
  responseType: 'blob'
});

// Export apiClient for direct usage
export { api as apiClient };
export default api;
