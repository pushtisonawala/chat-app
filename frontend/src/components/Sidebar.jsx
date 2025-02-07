import { useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { Users, UserCircle, UsersRound } from 'lucide-react';
import { useAuthStore } from "../../store/useAuthStore";
import {SidebarSkeleton} from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { groups, fetchGroups, selectedGroup, setSelectedGroup } = useGroupStore();
    const { onlineUsers } = useAuthStore();

    useEffect(() => {
        getUsers();
        fetchGroups();
    }, [getUsers, fetchGroups]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSelectedGroup(null);
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
    };

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-zinc-800 flex flex-col bg-zinc-900">
            {/* Header */}
            <div className="border-b border-zinc-800 w-full p-5">
                <div className="flex items-center gap-2">
                    <Users className="size-6 text-zinc-400" />
                    <span className="font-medium hidden lg:block text-zinc-300">Chats</span>
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 py-4">
                {/* Groups Section */}
                <div className="space-y-4">
                    <div className="px-4">
                        <div className="flex items-center gap-2">
                            <UsersRound className="size-4 text-zinc-400" />
                            <span className="text-sm font-medium hidden lg:block text-zinc-400">Groups</span>
                        </div>
                    </div>
                    <div className="space-y-1 px-2">
                        {groups.map((group) => (
                            <button
                                key={group._id}
                                onClick={() => handleGroupSelect(group)}
                                className={`w-full p-2 flex items-center gap-2 rounded-lg hover:bg-zinc-800/50 transition-colors ${
                                    selectedGroup?._id === group._id ? "bg-zinc-800" : ""
                                }`}
                            >
                                <div className="relative mx-auto lg:mx-0">
                                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <UsersRound className="size-6 text-blue-400" />
                                    </div>
                                </div>
                                <span className="hidden lg:block truncate text-zinc-300">{group.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Section */}
                <div className="space-y-4 mt-8">
                    <div className="px-4">
                        <div className="flex items-center gap-2">
                            <UserCircle className="size-4 text-zinc-400" />
                            <span className="text-sm font-medium hidden lg:block text-zinc-400">Direct Messages</span>
                        </div>
                    </div>
                    <div className="space-y-1 px-2">
                        {users.map((user) => (
                            <button 
                                key={user._id} 
                                onClick={() => handleUserSelect(user)}
                                className={`w-full p-2 flex items-center gap-3 rounded-lg hover:bg-zinc-800/50 transition-colors ${
                                    selectedUser?._id === user._id ? "bg-zinc-800" : ""
                                }`}
                            >
                                <div className="relative mx-auto lg:mx-0">
                                    <img 
                                        src={user.profilePic || "/avatar.jpg"} 
                                        alt={user.fullName} 
                                        className="size-10 object-cover rounded-full border border-zinc-800"
                                    />
                                    {onlineUsers.includes(user._id) && (
                                        <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                                    )}
                                </div>
                                <div className="hidden lg:block text-left min-w-0">
                                    <div className="font-medium truncate text-zinc-300">{user.fullName}</div>
                                    <div className="text-sm text-zinc-500">
                                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;