import { create } from "zustand";
import { axiosInstance } from "../src/lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";


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
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
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
      set({ authUser: res.data });
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

    const socketURL = process.env.NODE_ENV === 'production'
      ? 'https://chat-app-1-jb79.onrender.com'  // Your deployed backend URL
      : 'http://localhost:5001';

    const socket = io(socketURL, {
      transports: ["websocket"],
      query: { userId: authUser._id },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

    socket.on("getOnlineUsers", (userIds) => {
      console.log("Received online users:", userIds); 
      set({ onlineUsers: userIds });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
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
