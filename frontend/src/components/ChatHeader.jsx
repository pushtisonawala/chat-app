import { X, Users } from "lucide-react"
import { useAuthStore } from "../../store/useAuthStore"
import { useChatStore } from "../../store/useChatStore"
import { useGroupStore } from "../../store/useGroupStore"

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore()
    const { selectedGroup, setSelectedGroup } = useGroupStore()
    const { onlineUsers } = useAuthStore()

    const handleClose = () => {
        if (selectedUser) setSelectedUser(null);
        if (selectedGroup) setSelectedGroup(null);
    }

    if (selectedGroup) {
        return (
            <div className="p-2.5 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="size-10 rounded-full relative bg-blue-500/10 flex items-center justify-center">
                                <Users className="size-6 text-blue-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium">{selectedGroup.name}</h3>
                            <p className="text-sm text-base-content/70">
                                {selectedGroup.members?.length || 0} members
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

    if (selectedUser) {
        return (
            <div className="p-2.5 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="size-10 rounded-full relative">
                                <img 
                                    src={selectedUser.profilePic || "/avatar.jpg"} 
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