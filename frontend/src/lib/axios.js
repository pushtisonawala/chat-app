import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        if (error.response?.status === 500) {
            toast.error('Server error. Please try again later.');
        }
        return Promise.reject(error);
    }
);

export { axiosInstance };
