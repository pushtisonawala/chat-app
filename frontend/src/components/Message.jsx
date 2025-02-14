import { useMemo } from 'react';

const Message = ({ message, isOwnMessage }) => {
    const formattedText = useMemo(() => {
        let text = message.text;

        // Handle @gemini mentions
        text = text.replace(/@gemini\b/g, '<span class="text-blue-400 font-semibold">@gemini</span>');

        // Handle user mentions
        if (message.mentions?.length) {
            message.mentions.forEach(mention => {
                // Use email as fallback if username is not available
                const mentionText = mention.username || mention.email.split('@')[0];
                if (mentionText) {
                    const regex = new RegExp(`@${mentionText}\\b`, 'g');
                    text = text.replace(regex, `<span class="text-blue-400 font-semibold">@${mentionText}</span>`);
                }
            });
        }

        return text;
    }, [message]);

    return (
        <div className="chat-bubble">
            <p dangerouslySetInnerHTML={{ __html: formattedText }} />
        </div>
    );
};

export default Message;
