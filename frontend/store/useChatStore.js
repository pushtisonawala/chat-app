import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../src/lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null, 
  isUsersLoading: false,
  isMessagesLoading: false,

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

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    get().subscribeToMessages();
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }), // Fixed the function name and syntax
}));
