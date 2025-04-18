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

  sendMessage: async ({ text }) => {
    try {
      const { selectedUser } = get();
      if (!selectedUser?._id) return;

      const { data } = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text });
      set(state => ({
        messages: [...state.messages, data]
      }));
      return data;
    } catch (error) {
      toast.error("Failed to send message");
      throw error;
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

  setMessages: (messages) => set({ messages }), // Make sure this exists
  
  // Or if you want to use a function
  setMessages: (messageUpdater) => {
    if (typeof messageUpdater === 'function') {
      set(state => ({ messages: messageUpdater(state.messages) }));
    } else {
      set({ messages: messageUpdater });
    }
  },

  addMessage: (message) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },
}));
