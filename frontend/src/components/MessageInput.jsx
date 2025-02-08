import { useState, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { X, Image, Send } from "lucide-react";

const MessageInput = ({ isGroup }) => {
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null); // Store the file instead of a preview
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();
    const { sendGroupMessage } = useGroupStore();

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
        if (!text.trim() && !imageFile) return;

        const formData = new FormData(); // Create a FormData object
        formData.append("text", text.trim()); // Append the text
        if (imageFile) {
            formData.append("image", imageFile); // Append the image file
        }

        try {
            if (isGroup) {
                await sendGroupMessage(formData);
            } else {
                await sendMessage(formData);
            }
            setText("");
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="p-4 w-full">
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
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder={`Type a ${isGroup ? 'group' : ''} message...`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
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