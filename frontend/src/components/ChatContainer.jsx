import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = ({ isGroup }) => {
  const { 
    messages: privateMessages, 
    selectedUser, 
    getMessages, 
    isMessagesLoading, 
    subscribeToMessages, 
    unsubscribeFromMessages,
    setMessages: setPrivateMessages  // Add this
  } = useChatStore();
  const { messages: groupMessages, selectedGroup, fetchGroupMessages, handleNewMessage } = useGroupStore();
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  const messages = selectedUser ? privateMessages : groupMessages;
  const currentChat = selectedUser || selectedGroup;

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      
      if (socket) {
        // Listen for private messages
        socket.on("newMessage", (message) => {
          if (message.senderId === selectedUser._id) {
            setPrivateMessages(prev => [...prev, message]);  // Use setPrivateMessages instead
          }
        });
      }

      return () => {
        if (socket) {
          socket.off("newMessage");
        }
      };
    } else if (selectedGroup?._id && socket) {
      // Join group and listen for group messages
      socket.emit('joinGroup', selectedGroup._id);
      
      socket.on('receiveGroupMessage', (message) => {
        if (message.groupId === selectedGroup._id) {
          handleNewMessage(message);
        }
      });

      fetchGroupMessages(selectedGroup._id);

      return () => {
        socket.emit('leaveGroup', selectedGroup._id);
        socket.off('receiveGroupMessage');
      };
    }
  }, [selectedUser?._id, selectedGroup?._id, socket]);

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
        {messages?.map((message, index) => {  // Added index parameter
          const isOwnMessage = message.senderId?._id === authUser._id || message.senderId === authUser._id;
          const isLastMessage = index === messages.length - 1;  // Check if last message
          
          return (
            <div
              key={`${message._id}-${index}`}  // Added index to ensure unique keys
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              ref={isLastMessage ? messageEndRef : null}  // Only add ref to last message
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={isOwnMessage 
                      ? authUser.profilePic || "/avatar.jpg" 
                      : message.senderId?.profilePic || "/avatar.jpg"}
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header">
                {isGroup && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {isOwnMessage ? "You" : message.senderId?.fullName}
                    </span>
                  </div>
                )}
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble">
                <p>{message.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput isGroup={!!selectedGroup} />
    </div>
  );
};

export default ChatContainer;
