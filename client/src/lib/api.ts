import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api', // Adjust if deployed
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[CLIENT-API] Requesting: ${config.baseURL || ''}${config.url}`, config);
    return config;
});

export default api;
