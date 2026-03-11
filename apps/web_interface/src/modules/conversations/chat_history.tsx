import { useEffect, useRef } from "react";
import {
    useChat,
    type CHAT_MESSAGE,
    type AGENT_CONTENT,
} from "../../stores/chat_store";
import AgentResponseDisplay from "../agent/agent_response";

const ChatHistory = () => {
    const { messages } = useChat();

    const containerRef = useRef<HTMLDivElement>(null);
    const prevAgentCountRef = useRef<number>(0);

    const agent_messages = messages.filter(
        (message) => message.role === "agent",
    );

    const agentCount = agent_messages.length;
    const latestAgentId = agent_messages[agent_messages.length - 1]?.id;

    // Auto-scroll to latest agent message when a new one arrives
    useEffect(() => {
        if (agentCount > prevAgentCountRef.current && latestAgentId) {
            requestAnimationFrame(() => {
                const element = document.getElementById(
                    `chat-turn-${latestAgentId}`,
                );

                if (element && containerRef.current) {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect =
                        containerRef.current.getBoundingClientRect();
                    const scrollOffset =
                        containerRef.current.scrollTop +
                        (elementRect.top - containerRect.top);

                    containerRef.current.scrollTo({
                        top: scrollOffset,
                        behavior: "smooth",
                    });
                }
            });
        }

        prevAgentCountRef.current = agentCount;
    }, [agentCount, latestAgentId]);

    const turn_map = new Map<string, number>();
    let turn_counter = 0;

    agent_messages.forEach((message) => {
        const has_tools = message.agent_content.some(
            (content) =>
                content.type === "tool_function_call" ||
                content.type === "tool_function_result",
        );

        if (has_tools) {
            turn_counter += 1;
            turn_map.set(message.id, turn_counter);
        }
    });

    // Empty state
    if (agent_messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-400">
                <p>Start a conversation...</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 w-full overflow-y-auto pb-[100vh]">
            <div className="max-w-2xl mx-auto space-y-4">
                {agent_messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        turn_number={turn_map.get(message.id)}
                    />
                ))}
            </div>
        </div>
    );
};

// Individual message bubble
type MESSAGE_BUBBLE_TYPES = {
    message: CHAT_MESSAGE;
    turn_number?: number;
};

const MessageBubble = ({ message, turn_number }: MESSAGE_BUBBLE_TYPES) => {
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
        <div id={`chat-turn-${message.id}`}>
            {turn_number && (
                <div className="sticky top-0 z-10 bg-neutral-200 dark:bg-neutral-800 px-3 py-2">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Turn {turn_number}
                    </span>
                </div>
            )}

            <div className="flex justify-center p-4 text-neutral-800 dark:text-neutral-200">
                <AgentMessageContent content={message.agent_content} />
            </div>
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
