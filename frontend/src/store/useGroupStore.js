import { create } from 'zustand'; // Corrected import statement
import axios from 'axios';

export const useGroupStore = create((set) => ({
  groups: [],
  createGroup: async (groupData) => {
    try {
      const response = await axios.post('/api/groups', groupData);
      set((state) => ({
        groups: [...state.groups, response.data],
      }));
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  },
  fetchGroups: async () => {
    try {
      const response = await axios.get('/api/groups');
      set({ groups: response.data });
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  },
}));
