import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Members</label>
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : !Array.isArray(users) || users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No users available</div>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded p-2">
                {users.map(user => (
                  <label key={user._id} className="flex items-center p-2 hover:bg-gray-100">
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
                      className="mr-2"
                    />
                    <span>{user.fullName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!groupName.trim() || selectedUsers.length === 0}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;