import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = ({ isGroup }) => {
  const { messages: privateMessages, selectedUser, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { messages: groupMessages, selectedGroup, fetchGroupMessages, handleNewMessage } = useGroupStore();
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  const messages = selectedUser ? privateMessages : groupMessages;
  const currentChat = selectedUser || selectedGroup;

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);

      if (socket) {
        subscribeToMessages();
      } else {
        console.error("Socket is not connected.");
      }

      return () => unsubscribeFromMessages();
    } else if (selectedGroup?._id) {
      fetchGroupMessages(selectedGroup._id);
    }
  }, [selectedUser?._id, selectedGroup?._id, getMessages, fetchGroupMessages, subscribeToMessages, unsubscribeFromMessages, socket]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) {
      console.log('Initializing socket...');
      useAuthStore.getState().connectSocket();
    }
  }, [socket]);

  useEffect(() => {
    if (isGroup && selectedGroup && socket) {
      // Join the group room when selected
      socket.emit('joinGroup', selectedGroup._id);

      // Listen for new messages
      socket.on('newGroupMessage', handleNewMessage);

      return () => {
        // Leave the group room when deselected
        socket.emit('leaveGroup', selectedGroup._id);
        socket.off('newGroupMessage');
      };
    }
  }, [selectedGroup, socket, isGroup]);

  useEffect(() => {
    if (isGroup && selectedGroup?._id) {
      fetchGroupMessages(selectedGroup._id);
    }
  }, [selectedGroup?._id]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <div>No contact selected</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId?._id === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message.senderId?._id === authUser._id 
                    ? authUser.profilePic || "/avatar.jpg" 
                    : message.senderId?.profilePic || "/avatar.jpg"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header">
              {/* Updated sender name display */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {message.senderId?._id === authUser._id 
                    ? "You"
                    : message.senderId?.fullName}
                </span>
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      <MessageInput isGroup={!!selectedGroup} />
    </div>
  );
};

export default ChatContainer;
