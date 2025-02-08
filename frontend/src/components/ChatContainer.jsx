import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { messages: privateMessages, selectedUser, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { messages: groupMessages, selectedGroup, fetchGroupMessages } = useGroupStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const socket = useAuthStore(state => state.socket);

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
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.jpg" : selectedUser?.profilePic || selectedGroup?.profilePic || "/avatar.jpg"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput isGroup={!!selectedGroup} />
    </div>
  );
};

export default ChatContainer;
