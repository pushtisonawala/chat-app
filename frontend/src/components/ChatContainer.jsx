import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { formatMessageTime } from "../lib/utils";

const ThinkingIndicator = () => (
  <div className="chat chat-start">
    <div className="chat-image avatar">
      <div className="size-10 rounded-full border">
        <img 
          src="https://api.dicebear.com/7.x/bottts/svg?seed=gemini&backgroundColor=d1d5db&eyes=happy&mouth=smile" 
          alt="Gemini"
        />
      </div>
    </div>
    <div className="chat-header">
      <span className="font-bold text-sm">Gemini AI</span>
    </div>
    <div className="chat-bubble">
      <div className="flex items-center gap-2">
        <span>Thinking</span>
        <span className="loading loading-dots loading-md"></span>
      </div>
    </div>
  </div>
);

const ChatContainer = ({ isGroup }) => {
  const [isAITyping, setIsAITyping] = useState(false);
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

  const getMessageProfile = (message, isOwnMessage) => {
    if (message.isAIMessage) {
      return "https://api.dicebear.com/7.x/bottts/svg?seed=gemini&backgroundColor=d1d5db&eyes=happy&mouth=smile";
    }
    
    if (isGroup) {
      return message.senderId?.profilePic || "/avatar.jpg";
    }

    if (isOwnMessage) {
      return authUser?.profilePic || "/avatar.jpg";
    }

    return message.senderId?.profilePic || "/avatar.jpg";
  };

  const getSenderName = (message, isOwnMessage) => {
    console.log('Message:', message); // Debug
    if (isOwnMessage) return "You";
    if (message.isAIMessage) return "Gemini AI";
    return message.senderId?.fullName || "Unknown User";
  };

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
    }
  }, [selectedUser?._id, socket]);

  // Single socket effect for handling all group messages
  useEffect(() => {
    if (selectedGroup?._id && socket) {
      const handleMessage = (message, type = 'normal') => {
        if (message.groupId === selectedGroup._id) {
          handleNewMessage(type === 'ai' ? { ...message, isAIMessage: true } : message);
          messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      };

      socket.emit('joinGroup', selectedGroup._id);
      fetchGroupMessages(selectedGroup._id);

      // Set up single handlers for all message types
      socket.on('receiveGroupMessage', msg => handleMessage(msg));
      socket.on('receiveAIMessage', msg => handleMessage(msg, 'ai'));
      socket.on('aiTyping', (typing) => {
        console.log('AI typing status:', typing); // Debug log
        setIsAITyping(typing);
      });

      return () => {
        socket.emit('leaveGroup', selectedGroup._id);
        ['receiveGroupMessage', 'receiveAIMessage', 'aiTyping'].forEach(event => {
          socket.off(event);
        });
      };
    }
  }, [selectedGroup?._id, socket]);

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
                    src={getMessageProfile(message, isOwnMessage)}
                    alt={message.isAIMessage ? "AI" : `${message.senderId?.fullName || 'User'}'s profile`}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="chat-header flex items-center gap-2">
                <span className="font-bold text-sm">
                  {getSenderName(message, isOwnMessage)}
                </span>
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
        {isAITyping && <ThinkingIndicator />}
      </div>
      <MessageInput 
        isGroup={!!selectedGroup} 
        disabled={isAITyping}
        placeholder={isGroup ? "Type @gemini followed by your question" : "Type a message..."}
      />
    </div>
  );
};

export default ChatContainer;
