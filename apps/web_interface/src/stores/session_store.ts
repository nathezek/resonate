import { create } from "zustand";
import { useChat } from "./chat_store";
import { useKeyboard } from "./keyboard_store";

type SESSION_STATE_TYPES = {
    // States
    session_status: "idle" | "dialing" | "active";
    is_mic_muted: boolean;
    is_session_paused: boolean;
    session_start_time: number | null;

    // Actions
    start_dailing: () => void;
    start_session: () => Promise<void>;
    end_session: () => void;
    toggle_mute: () => void;
    toggle_session_pause: () => void;
};

export const useSession = create<SESSION_STATE_TYPES>((set) => ({
    // ---- Initial States -----
    session_status: "idle",
    is_mic_muted: false,
    is_session_paused: false,
    session_start_time: null,

    // ----- Actions ------

    start_dailing: () => set({ session_status: "dialing" }),

    start_session: async () =>
        set({ session_status: "active", session_start_time: Date.now() }),

    end_session: () => {
        useChat.getState().clear_all_messages();
        useKeyboard.getState().disable_keyboard();

        set({
            session_status: "idle",
            is_mic_muted: false,
            is_session_paused: false,
            session_start_time: null,
        });
    },

    toggle_session_pause: () =>
        set((state) => ({ is_session_paused: !state.is_session_paused })),

    toggle_mute: () => set((state) => ({ is_mic_muted: !state.is_mic_muted })),
}));
