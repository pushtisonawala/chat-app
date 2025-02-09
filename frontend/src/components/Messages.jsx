import { useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = ({ messages }) => {
    const lastMessageRef = useRef();
    const { authUser } = useAuthStore();
    const { messages, loading } = useGetMessages();
    useListenMessages();

    // Sort messages by creation time if needed
    const sortedMessages = useMemo(() => {
        return [...messages].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
    }, [messages]);

    useEffect(() => {
        // Scroll to latest message
        setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [sortedMessages]);

    return (
        <div className="px-4 flex-1 overflow-auto">
            {sortedMessages.map((message, idx) => (
                <div
                    key={message._id || idx}
                    ref={idx === sortedMessages.length - 1 ? lastMessageRef : null}
                >
                    <Message message={message} />
                </div>
            ))}
            {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
            {!loading && messages.length === 0 && (
                <p className='text-center'>Send a message to start the conversation</p>
            )}
        </div>
    );
};

export default Messages;