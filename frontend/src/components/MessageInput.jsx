import { useState, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { X, Image, Send } from "lucide-react";
import toast from 'react-hot-toast';  // Add this import

const MessageInput = ({ isGroup }) => {
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null); // Store the file instead of a preview
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const { sendMessage } = useChatStore();
    const { sendGroupMessage, selectedGroup } = useGroupStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // Store the file directly
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            if (isGroup) {
                const groupId = useGroupStore.getState().selectedGroup?._id;
                if (!groupId) {
                    toast.error('No group selected');
                    return;
                }
                await sendGroupMessage(groupId, text.trim());  // Just pass the text directly
            } else {
                await sendMessage({ text: text.trim() });
            }
            setText("");
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        }
    };

    const filterMembers = (query) => {
        if (!isGroup) return [];
        
        // Add Gemini AI to suggestions
        const geminiSuggestion = {
            _id: 'gemini',
            fullName: 'Gemini AI',
            username: 'gemini',
            profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=gemini'
        };

        const members = selectedGroup?.members || [];
        console.log('Available members:', members); // Debug log

        // Filter out members without fullName or username
        const validMembers = members.filter(member => member.fullName && member.email);
        const allSuggestions = [geminiSuggestion, ...validMembers];

        return allSuggestions.filter(member => {
            const searchTerm = query.toLowerCase();
            return member.fullName.toLowerCase().includes(searchTerm) || 
                   (member.email && member.email.toLowerCase().includes(searchTerm));
        });
    };

    const handleInput = (e) => {
        const value = e.target.value;
        setText(value);

        // Check for mention trigger
        const lastWord = value.split(' ').pop();
        if (lastWord.startsWith('@')) {
            setMentionQuery(lastWord.slice(1));
            setShowMentions(true);
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (member) => {
        const words = text.split(' ');
        words.pop(); // Remove the partial @mention

        let mentionText;
        if (member._id === 'gemini') {
            mentionText = '@gemini';
        } else {
            // Use email as username if no username is set
            const username = member.username || member.email.split('@')[0];
            mentionText = `@${username}`;
        }

        const newText = [...words, `${mentionText} `].join(' ');
        setText(newText);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    return (
        <div className="p-4 w-full relative">
            {imageFile && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={URL.createObjectURL(imageFile)} // Create a URL for the file
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                            type="button"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder={`Type a message... (Use @ to mention)`}
                        value={text}
                        onChange={handleInput}
                    />
                    
                    {showMentions && (
                        <div className="absolute bottom-full left-0 bg-base-200 rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto w-64">
                            {filterMembers(mentionQuery).map(member => (
                                <div
                                    key={member._id}
                                    className="p-2 hover:bg-base-300 cursor-pointer rounded flex items-center gap-2"
                                    onClick={() => insertMention(member)}
                                >
                                    <img 
                                        src={member.profilePic} 
                                        alt={member.fullName}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className={member._id === 'gemini' ? 'text-blue-400' : ''}>
                                        {member.fullName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />
                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle ${imageFile ? "text-emerald-500" : "text-zinc-400"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && !imageFile}
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;