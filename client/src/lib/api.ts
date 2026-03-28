import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[CLIENT-API] Requesting: ${config.baseURL || ''}${config.url}`);
    return config;
});

api.interceptors.response.use(
    (response) => {
        
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
            
            return {
                ...response,
                data: response.data.data
            };
        }
        return response;
    },
    (error) => {
        
        if (error.response?.data && typeof error.response.data === 'object' && error.response.data.message) {
            
            error.response.data.error = error.response.data.message;
        }
        return Promise.reject(error);
    }
);

export default api;
