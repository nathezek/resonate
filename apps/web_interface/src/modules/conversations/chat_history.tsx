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
        <div className="flex-1 w-full overflow-y-auto pb-32">
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
    const agent_text_content = message.agent_content.filter(
        (item) =>
            item.type === "chunk" ||
            item.type === "response" ||
            item.type === "loading" ||
            item.type === "error",
    );

    if (agent_text_content.length === 0) {
        return null;
    }

    return (
        <div className="flex justify-center p-4 text-neutral-800">
            <AgentMessageContent content={message.agent_content} />
        </div>
    );
};

// Render agent message content
const AgentMessageContent = ({ content }: { content: AGENT_CONTENT[] }) => {
    const text_content = content.filter(
        (item) =>
            item.type === "chunk" ||
            item.type === "response" ||
            item.type === "loading" ||
            item.type === "error",
    );

    if (text_content.length === 0) {
        return <span className="text-neutral-400">...</span>;
    }

    return (
        <div className="space-y-2">
            {text_content.map((item, idx) => (
                <AgentResponseDisplay key={idx} response={item} />
            ))}
        </div>
    );
};

export default ChatHistory;
