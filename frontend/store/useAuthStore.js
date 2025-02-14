import { create } from "zustand";
import { axiosInstance } from "../src/lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) {
  throw new Error('VITE_API_URL environment variable is not defined');
}

// Remove trailing slash if present
const normalizedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [], 
  socket: null, 

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('jwt-token');
      if (!token) {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }

      const res = await axiosInstance.get("/auth/check", {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ authUser: res.data, isCheckingAuth: false });
    } catch (error) {
      console.error("Error in checkAuth:", error);
      localStorage.removeItem('jwt-token');
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const { token, ...user } = res.data;
      localStorage.setItem('jwt-token', token);
      set({ authUser: user });
      toast.success("Logged in successfully");
      get().connectSocket(); // Connect to the socket after successful login
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket(); 
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error(error.response?.data?.message || "Logout failed.");
    }
  },

updateProfile: async (formData) => {
  try {
      const res = await axiosInstance.put("/auth/update-profile", formData, {
          headers: {
              "Content-Type": "multipart/form-data", 
          },
      });
      set({ authUser: { ...get().authUser, profilePic: res.data.profilePic } });
      toast.success("Profile picture updated successfully!");
  } catch (error) {
      console.error("Error updating profile picture:", error);
  }
},

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      transports: ["websocket"], 
      query: { userId: authUser._id }, 
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', {
        message: error.message,
        description: error.description,
        type: error.type
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      console.log("Socket disconnected.");
      set({ socket: null }); 
    }
  },
}));
