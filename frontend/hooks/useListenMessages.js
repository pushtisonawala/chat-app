import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const useListenMessages = () => {
    const { socket } = useAuthStore();
    const { setMessages } = useChatStore();
    const { selectedGroup, messages: groupMessages, setMessages: setGroupMessages } = useGroupStore();

    useEffect(() => {
        if (!socket) return;

        // Listen for private messages
        socket.on("newMessage", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for group messages
        socket.on("newGroupMessage", (message) => {
            if (selectedGroup && message.groupId === selectedGroup._id) {
                setGroupMessages([...groupMessages, message]);
            }
        });

        return () => {
            socket.off("newMessage");
            socket.off("newGroupMessage");
        };
    }, [socket, selectedGroup, groupMessages]);
};

export default useListenMessages;
