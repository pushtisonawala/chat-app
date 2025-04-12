import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://chat-app-1-jb79.onrender.com/api'  // Your deployed backend URL
  : 'http://localhost:5001/api';

const axiosInstance = axios.create({
    baseURL,
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
