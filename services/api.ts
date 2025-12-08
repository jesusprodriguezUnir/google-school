import axios from 'axios';
import { SchoolData, User } from '../types';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (email: string, password = 'password') => {
        // 1. Get Token
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);

        return access_token;
    },

    register: async (name: string, email: string, password: string, role: string) => {
        const response = await api.post('/register', {
            name,
            email,
            password,
            role,
            avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/users/me');
        return response.data;
    },

    getBootstrapData: async (): Promise<SchoolData> => {
        const response = await api.get('/api/bootstrap');
        // Wait, in main.py: app.include_router(api.router) -> api router has prefix="/api". 
        // And endpoint path is "/bootstrap". So it is "/api/bootstrap".
        // Let me check my previous edit.
        // backend/routers/api.py: router = APIRouter(prefix="/api", tags=["Dashboard"])
        // backend/routers/api.py endpoint: @router.get("/bootstrap")
        // So URL is /api/bootstrap.
        // wait, I put /api/api/bootstrap in the code just now? No, I should verify.
        return response.data;
    }
};

// Fix logic in next step if I got the URL wrong.
export const classService = {
    getAll: async () => {
        const response = await api.get('/classes/');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/classes/', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/classes/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/classes/${id}`);
        return response.data;
    }
};

export default api;
