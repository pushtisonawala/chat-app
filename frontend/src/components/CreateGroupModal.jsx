import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { X, Users, Search, UserPlus } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]); // Initialize as empty array
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/auth/users');
        if (isMounted && Array.isArray(data)) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        if (isMounted) {
          toast.error('Failed to fetch users');
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast.error('Please enter group name and select members');
      return;
    }

    try {
      await axiosInstance.post('/groups', {
        name: groupName,
        members: selectedUsers
      });
      toast.success('Group created successfully');
      setGroupName('');
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">Create New Group</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter group name"
              required
            />
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Members <span className="text-gray-400 text-xs">({selectedUsers.length} selected)</span>
            </label>
            
            {/* Search Box */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Users List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">Loading members...</p>
              </div>
            ) : !Array.isArray(users) || users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <UserPlus className="h-8 w-8 mb-2" />
                <p>No members available</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 divide-y">
                {users.map(user => (
                  <label 
                    key={user._id} 
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        setSelectedUsers(prev => 
                          e.target.checked 
                            ? [...prev, user._id]
                            : prev.filter(id => id !== user._id)
                        );
                      }}
                      className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 mr-3"
                    />
                    <div className="flex items-center flex-1">
                      <img
                        src={user.profilePic || "/avatar.jpg"}
                        alt={user.fullName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || selectedUsers.length === 0}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;