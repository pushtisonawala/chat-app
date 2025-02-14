import { X, Users, Camera } from "lucide-react"
import { useAuthStore } from "../../store/useAuthStore"
import { useChatStore } from "../../store/useChatStore"
import { useGroupStore } from "../../store/useGroupStore"
import { useState, useRef } from "react"
import toast from "react-hot-toast"
import { axiosInstance } from '../lib/axios';

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore()
    const { selectedGroup, setSelectedGroup } = useGroupStore()
    const { onlineUsers } = useAuthStore()
    const [showingSummary, setShowingSummary] = useState(false)
    const fileInputRef = useRef(null);

    const handleClose = () => {
        if (selectedUser) setSelectedUser(null);
        if (selectedGroup) setSelectedGroup(null);
    }

    const handleGetSummary = async () => {
        if (!selectedGroup) return;
        
        setShowingSummary(true);
        const summary = await useGroupStore.getState().getUnreadSummary(selectedGroup._id);
        if (summary) {
          toast((t) => (
            <div>
              <h3 className="font-bold mb-2">Message Summary</h3>
              <p>{summary.summary}</p>
              <p className="text-sm mt-2">
                {summary.unreadCount} messages since your last visit
              </p>
            </div>
          ), { duration: 5000 });
        }
        setShowingSummary(false);
    };

    const handleGroupProfileUpdate = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error('Image size should be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('groupProfilePic', file);

        try {
            const { data } = await axiosInstance.put(
                `/groups/${selectedGroup._id}/profile`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log('Upload progress:', percentCompleted);
                    }
                }
            );
            
            useGroupStore.getState().updateGroupProfile(data);
            toast.success('Group profile updated successfully');
        } catch (error) {
            console.error('Error updating group profile:', error);
            toast.error(error.response?.data?.error || 'Failed to update group profile');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset file input
            }
        }
    };

    // Get the appropriate profile pic based on chat type
    const getProfilePic = () => {
        if (selectedGroup) {
            return selectedGroup.groupProfilePic || "https://api.dicebear.com/7.x/initials/svg?seed=" + selectedGroup.name;
        }
        return selectedUser?.profilePic || "/avatar.jpg";
    };

    if (selectedGroup) {
        return (
            <div className="p-2.5 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="size-10 rounded-full relative bg-blue-500/10 flex items-center justify-center">
                                <img
                                    src={getProfilePic()}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleGroupProfileUpdate}
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full hover:bg-blue-600 transition-colors"
                                >
                                    <Camera size={14} className="text-white" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium">{selectedGroup.name}</h3>
                            <p className="text-sm text-base-content/70">
                                {selectedGroup.members?.length || 0} members
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleGetSummary}
                            disabled={showingSummary}
                            className="btn btn-sm btn-ghost"
                        >
                            {showingSummary ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <span>Get Summary</span>
                            )}
                        </button>
                        <button onClick={handleClose}>
                            <X />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (selectedUser) {
        return (
            <div className="p-2.5 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="size-10 rounded-full relative">
                                <img 
                                    src={getProfilePic()} 
                                    alt={selectedUser.fullName}
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium">{selectedUser.fullName}</h3>
                            <p className="text-sm text-base-content/70">
                                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose}>
                        <X />
                    </button>
                </div>
            </div>
        )
    }

    return null;
}

export default ChatHeader;