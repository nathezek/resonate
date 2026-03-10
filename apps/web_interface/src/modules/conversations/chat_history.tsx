import { useEffect, useRef } from "react";
import {
    useChat,
    type CHAT_MESSAGE,
    type AGENT_CONTENT,
} from "../../stores/chat_store";
import AgentResponseDisplay from "../agent/agent_response";

const ChatHistory = () => {
    const { messages } = useChat();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Empty state
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-400">
                <p>Start a conversation...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full overflow-y-auto pt-12 pb-32">
            <div className="max-w-2xl mx-auto space-y-4">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

// Individual message bubble
const MessageBubble = ({ message }: { message: CHAT_MESSAGE }) => {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                        ? "bg-neutral-700 text-neutral-100"
                        : "bg-neutral-200 text-neutral-800"
                }`}
            >
                {isUser ? (
                    <p>{message.user_content}</p>
                ) : (
                    <AgentMessageContent content={message.agent_content} />
                )}
            </div>
        </div>
    );
};

// Render agent message content
const AgentMessageContent = ({ content }: { content: AGENT_CONTENT[] }) => {
    if (content.length === 0) {
        return <span className="text-neutral-400">...</span>;
    }

    return (
        <div className="space-y-2">
            {content.map((item, idx) => (
                <AgentResponseDisplay key={idx} response={item} />
            ))}
        </div>
    );
};

export default ChatHistory;
