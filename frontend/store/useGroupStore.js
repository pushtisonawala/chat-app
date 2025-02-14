import { create } from 'zustand';
import { axiosInstance } from '../src/lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';  // Add this import

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  loading: false,
  error: null,
  messages: [],
  lastRead: {},

  setSelectedGroup: (group) => set({ selectedGroup: group, messages: [] }),

  fetchGroups: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get('/groups'); // Removed extra /api
      set({ groups: data, error: null });
    } catch (error) {
      console.error('Error fetching groups:', error);
      set({ error: 'Failed to fetch groups' });
      toast.error('Failed to fetch groups');
    } finally {
      set({ loading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const { data } = await axiosInstance.post('/groups', groupData); // Removed extra /api
      set(state => ({
        groups: [...state.groups, data]
      }));
      toast.success('Group created successfully');
      return true;
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      return false;
    }
  },

  setMessages: (messages) => set({ messages }),

  sendGroupMessage: async (groupId, text) => {
    try {
      const { data } = await axiosInstance.post(`/messages/group/${groupId}`, { text });
      return data;
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    }
  },

  handleNewMessage: (message) => {
    set(state => {
      // Prevent duplicate messages with strict checking
      const isDuplicate = state.messages?.some(m => 
        m._id === message._id || // Same ID check
        (m.text === message.text && // Content check
         m.senderId?._id === message.senderId?._id && // Sender check
         Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 2000) // Time check (2 second window)
      );

      if (isDuplicate) {
        return state; // Return unchanged state if duplicate
      }

      // Add new message and maintain order
      const updatedMessages = [...(state.messages || []), message].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      return { messages: updatedMessages };
    });
  },

  fetchGroupMessages: async (groupId) => {
    try {
      const { data } = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ messages: data });
    } catch (error) {
      toast.error('Failed to fetch messages');
      console.error(error);
      set({ messages: [] });
    }
  },

  getUnreadSummary: async (groupId) => {
    try {
      const lastReadTime = get().lastRead[groupId] || new Date(0);
      const { data } = await axiosInstance.get(
        `/messages/group/${groupId}/summary?lastReadTime=${lastReadTime.toISOString()}`
      );
      return data;
    } catch (error) {
      console.error('Error getting summary:', error);
      toast.error('Failed to get message summary');
      return null;
    }
  },

  updateLastRead: (groupId) => {
    set(state => ({
      lastRead: {
        ...state.lastRead,
        [groupId]: new Date()
      }
    }));
  },

  updateGroupProfile: (updatedGroup) => {
    set(state => ({
      groups: state.groups.map(group => 
        group._id === updatedGroup._id ? updatedGroup : group
      ),
      selectedGroup: state.selectedGroup?._id === updatedGroup._id 
        ? updatedGroup 
        : state.selectedGroup
    }));
  }
}));
