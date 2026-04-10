import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
});


api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;



    const isLoginRequest = originalRequest.url?.includes('/user/login');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;
      try {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } catch (err) {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
