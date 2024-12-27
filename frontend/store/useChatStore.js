import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../src/lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null, // Fixed the initialization of selectedUser to null
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch users for messaging
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/user');
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Get messages for the selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
// Send a new message
sendMessage: async (messageData) => {
  const { selectedUser , messages } = get();
  try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser ._id}`, messageData, {
          headers: {
              'Content-Type': 'multipart/form-data', // Set the content type for FormData
          },
      });
      if (res && res.data) {
          set({ messages: [...messages, res.data] });
      } else {
          console.error("Failed to receive valid response:", res);
      }
  } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
  }
},
  // Subscribe to new messages
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket is not available.");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      if(newMessage.senderId!==selectedUser._id)return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  // Unsubscribe from new messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  // Set the selected user
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    get().subscribeToMessages(); // Automatically subscribe when a user is selected
  },
  // Set the selected user
  setSelectedUser: (selectedUser) => set({ selectedUser }), // Fixed the function name and syntax
}));
