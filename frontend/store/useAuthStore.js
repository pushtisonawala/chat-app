import { create } from "zustand";
import { axiosInstance } from "../src/lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const baseURL=import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";


export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [], // Array to store online users
  socket: null, // Store socket instance

  // Check if the user is authenticated
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Sign up a new user
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

  // Log in a user
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket(); // Connect to the socket after successful login
    } catch (error) {
      console.error("Error during login:", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Log out a user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket(); // Disconnect the socket on logout
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error(error.response?.data?.message || "Logout failed.");
    }
  },// Inside useAuthStore
// Inside useAuthStore
updateProfile: async (formData) => {
  try {
      const res = await axiosInstance.put("/auth/updateProfile", formData, {
          headers: {
              "Content-Type": "multipart/form-data", // Ensure proper headers for file uploads
          },
      });

      // Update the authUser profilePic after the backend call
      set({ authUser: { ...get().authUser, profilePic: res.data.profilePic } });
      toast.success("Profile picture updated successfully!");
  } catch (error) {
      console.error("Error updating profile picture:", error);
  }
},

  // Connect to Socket.IO
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      transports: ["websocket"], // Use WebSocket transport
      query: { userId: authUser._id }, // Send userId to server for mapping
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

    // Receive online users from the server
    socket.on("getOnlineUsers", (userIds) => {
      console.log("Received online users:", userIds); // Debug log
      set({ onlineUsers: userIds });
    });

    // Handle connection error
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    set({ socket });
  },

  // Disconnect from Socket.IO
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      console.log("Socket disconnected.");
      set({ socket: null }); // Clear the socket instance
    }
  },
}));
