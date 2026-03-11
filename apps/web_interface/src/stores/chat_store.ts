import { create } from "zustand";

type TEXT_MESSAGE = {
    type: "chunk" | "response" | "loading" | "error";
    data: string;
};

type TOOL_CALL_MESSAGE = {
    type: "tool_function_call";
    tool: string;
    args: any;
};

type TOOL_RESULT_MESSAGE = {
    type: "tool_function_result";
    tool: string;
    result: any;
};

type AGENT_CONTENT = TEXT_MESSAGE | TOOL_CALL_MESSAGE | TOOL_RESULT_MESSAGE;

type CHAT_MESSAGE = {
    id: string;
    role: "user" | "agent";
    user_content: string;
    agent_content: AGENT_CONTENT[];
    timestamp: number;
};

type CHAT_STORE_TYPES = {
    messages: CHAT_MESSAGE[];
    is_agent_responding: boolean;
    current_user_message: string | null;
    has_tools: boolean;
    is_tool_panel_open: boolean;
    responses_since_last_tool: number;

    // ACTIONS
    add_user_message: (text: string) => void;
    start_agent_response: () => void;
    append_agent_chunk: (chunk: string) => void;
    add_agent_tool_call: (tool: string, args: any) => void;
    add_agent_tool_result: (tool: string, result: any) => void;
    finish_agent_response: () => void;
    clear_current_user_message: () => void;
    clear_all_messages: () => void;
    toggle_tool_panel: () => void;
    set_tool_panel_open: (open: boolean) => void;
};

// ----- HELPER FUNCTION -----
const generate_id = (): string => {
    return Math.random().toString(36).substring(2, 9);
};

export const useChat = create<CHAT_STORE_TYPES>((set) => ({
    messages: [],
    is_agent_responding: false,
    current_user_message: null,
    has_tools: false,
    is_tool_panel_open: false,
    responses_since_last_tool: 0,

    // ---- ACTIONS -----
    add_user_message: (text) => {
        const new_user_message: CHAT_MESSAGE = {
            id: generate_id(),
            role: "user",
            user_content: text,
            agent_content: [],
            timestamp: Date.now(),
        };

        set((state) => ({
            messages: [...state.messages, new_user_message],
            current_user_message: text,
        }));
    },

    start_agent_response: () => {
        const new_agent_message: CHAT_MESSAGE = {
            id: generate_id(),
            role: "agent",
            user_content: "",
            agent_content: [{ type: "loading", data: "" }],
            timestamp: Date.now(),
        };

        set((state) => ({
            messages: [...state.messages, new_agent_message],
            is_agent_responding: true,
        }));
    },

    append_agent_chunk: (chunk) => {
        set((state) => {
            // 1. Copy the messages array
            const messages = [...state.messages];
            const last_index = messages.length - 1;

            // 2. Safety check: is the last message from the agent?
            if (last_index < 0 || messages[last_index].role !== "agent") {
                return state; // Do nothing
            }

            // 3. Copy the agent message and its content
            const agent_message = { ...messages[last_index] };
            const content = [...agent_message.agent_content];

            // 4. Find the last content piece
            const last_content_index = content.length - 1;
            const last_content = content[last_content_index];

            // 5. Decide what to do based on last content type
            if (last_content && last_content.type === "chunk") {
                // Append to existing chunk
                content[last_content_index] = {
                    ...last_content,
                    data: last_content.data + chunk,
                };
            } else if (last_content && last_content.type === "loading") {
                // Replace loading with first chunk
                content[last_content_index] = {
                    type: "chunk",
                    data: chunk,
                };
            } else {
                // Add new chunk (e.g., after a tool result)
                content.push({
                    type: "chunk",
                    data: chunk,
                });
            }

            // 6. Put it all back together
            agent_message.agent_content = content;
            messages[last_index] = agent_message;

            return { messages };
        });
    },

    add_agent_tool_call: (tool, args) => {
        set((state) => {
            const messages = [...state.messages];
            const last_index = messages.length - 1;

            if (last_index < 0 || messages[last_index].role !== "agent") {
                return state;
            }

            const agent_message = { ...messages[last_index] };
            agent_message.agent_content = [
                ...agent_message.agent_content,
                { type: "tool_function_call", tool, args },
            ];

            messages[last_index] = agent_message;

            return { messages, has_tools: true, is_tool_panel_open: true, responses_since_last_tool: 0 };
        });
    },

    add_agent_tool_result: (tool, result) => {
        set((state) => {
            const messages = [...state.messages];
            const last_index = messages.length - 1;

            if (last_index < 0 || messages[last_index].role !== "agent") {
                return state;
            }

            const agent_message = { ...messages[last_index] };
            agent_message.agent_content = [
                ...agent_message.agent_content,
                { type: "tool_function_result", tool, result },
            ];

            messages[last_index] = agent_message;

            return { messages };
        });
    },

    finish_agent_response: () => {
        set((state) => {
            // Check if the last agent message had any tool calls
            const last_agent = [...state.messages]
                .reverse()
                .find((m) => m.role === "agent");
            const had_tools = last_agent?.agent_content.some(
                (c) =>
                    c.type === "tool_function_call" ||
                    c.type === "tool_function_result",
            );

            const new_count = had_tools
                ? 0
                : state.responses_since_last_tool + 1;

            return {
                is_agent_responding: false,
                responses_since_last_tool: new_count,
                // Auto-close after 3 consecutive tool-free responses
                ...(new_count >= 3 ? { is_tool_panel_open: false } : {}),
            };
        });
    },

    clear_current_user_message: () => {
        set({ current_user_message: null });
    },

    clear_all_messages: () => {
        set({
            messages: [],
            is_agent_responding: false,
            current_user_message: null,
            has_tools: false,
            is_tool_panel_open: false,
            responses_since_last_tool: 0,
        });
    },

    toggle_tool_panel: () => {
        set((state) => ({ is_tool_panel_open: !state.is_tool_panel_open }));
    },

    set_tool_panel_open: (open) => {
        set({ is_tool_panel_open: open });
    },
}));

export type {
    CHAT_MESSAGE,
    AGENT_CONTENT,
    TEXT_MESSAGE,
    TOOL_CALL_MESSAGE,
    TOOL_RESULT_MESSAGE,
};
