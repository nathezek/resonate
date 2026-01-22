import { create } from "zustand";
import { type ChatMessage, askGemini } from "../api/gemini";

interface ChatHistoryState {
    history: ChatMessage[];
    loading: boolean;
    setLoading: (loading: boolean) => void;
    addMessage: (message: ChatMessage) => void;
    clearHistory: () => void;
    sendMessage: (input: string) => Promise<void>;
}

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => ({
    history: [],
    loading: false,

    setLoading: (loading) => set({ loading }),

    addMessage: (message) =>
        set((state) => ({ history: [...state.history, message] })),

    clearHistory: () => set({ history: [], loading: false }),

    sendMessage: async (input) => {
        const { history, addMessage, setLoading } = get();
        if (!input.trim() || get().loading) return;

        const newUserMsg: ChatMessage = {
            role: "user",
            parts: [{ text: input }],
        };

        addMessage(newUserMsg);
        setLoading(true);

        try {
            // Use the updated history including the new message
            const currentHistory = [...history, newUserMsg];
            const responseText = await askGemini(currentHistory);

            addMessage({
                role: "model",
                parts: [{ text: responseText }],
            });
        } catch (err) {
            addMessage({
                role: "model",
                parts: [
                    {
                        text: "Error: Brain disconnected. Check your connection.",
                    },
                ],
            });
        } finally {
            setLoading(false);
        }
    },
}));
