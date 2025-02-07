import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useGroupStore = create((set) => ({
  groups: [],
  selectedGroup: null,
  loading: false,
  error: null,

  setSelectedGroup: (group) => set({ selectedGroup: group }),

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
  }
}));
