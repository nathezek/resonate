import { useEffect, useRef } from "react";
import {
    useChat,
    type CHAT_MESSAGE,
    type AGENT_CONTENT,
} from "../../stores/chat_store";
import AgentResponseDisplay from "../agent/agent_response";

const ChatHistory = () => {
    const { messages, is_tool_panel_open } = useChat();

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
        <div
            ref={containerRef}
            className="flex-1 w-full relative overflow-y-auto pb-[100vh]"
        >
            {is_tool_panel_open && (
                <div className="flex items-center sticky top-0 py-2.5 justify-between z-30 bg-neutral-200 w-full px-3">
                    <h3 className="text-sm font-medium text-neutral-700">
                        Conversation History
                    </h3>
                </div>
            )}
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
    const has_visible_content = message.agent_content.some(
        (item) =>
            item.type === "chunk" ||
            item.type === "response" ||
            item.type === "loading" ||
            item.type === "error" ||
            item.type === "tool_function_call" ||
            item.type === "tool_function_result",
    );

    if (!has_visible_content) {
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
                <AgentMessageContent
                    content={message.agent_content}
                    message_id={message.id}
                />
            </div>
        </div>
    );
};

// Render agent message content — includes tool-ref chips inline
const AgentMessageContent = ({
    content,
    message_id,
}: {
    content: AGENT_CONTENT[];
    message_id: string;
}) => {
    const { set_tool_panel_open } = useChat();

    if (content.length === 0) {
        return <span className="text-neutral-400">...</span>;
    }

    return (
        <div className="space-y-2">
            {content.map((item, idx) => {
                // Tool items render as clickable reference chips
                if (
                    item.type === "tool_function_call" ||
                    item.type === "tool_function_result"
                ) {
                    return (
                        <ToolRefChip
                            key={idx}
                            tool_name={item.tool}
                            message_id={message_id}
                            on_open_panel={() => set_tool_panel_open(true)}
                        />
                    );
                }

                // Text items render normally
                return <AgentResponseDisplay key={idx} response={item} />;
            })}
        </div>
    );
};

// Clickable chip that links to a tool call in the tool panel
const ToolRefChip = ({
    tool_name,
    message_id,
    on_open_panel,
}: {
    tool_name: string;
    message_id: string;
    on_open_panel: () => void;
}) => {
    const handle_click = () => {
        // Open the panel first
        on_open_panel();

        // Wait for panel to render, then scroll to the tool turn
        requestAnimationFrame(() => {
            setTimeout(() => {
                const element = document.getElementById(
                    `tool-turn-${message_id}`,
                );
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 100);
        });
    };

    return (
        <button
            onClick={handle_click}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-400/10 border border-yellow-400/30 text-yellow-500 dark:text-yellow-400 text-xs font-medium hover:bg-yellow-400/20 hover:border-yellow-400/50 transition-all cursor-pointer"
        >
            <span>⚡</span>
            <span>{tool_name}</span>
            <span className="text-[10px] opacity-60">→</span>
        </button>
    );
};

export default ChatHistory;
