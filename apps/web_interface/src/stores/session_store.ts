import { create } from "zustand";
import { useChat } from "./chat_store";
import { useKeyboard } from "./keyboard_store";
import { useSessionTimer } from "./session_timer_store";

type SESSION_STATE_TYPES = {
    // States
    session_status: "idle" | "dialing" | "active";
    is_mic_muted: boolean;
    is_session_paused: boolean;

    // Actions
    start_dailing: () => void;
    start_session: () => Promise<void>;
    end_session: () => void;
    toggle_mute: () => void;
    toggle_session_pause: () => void;
};

export const useSession = create<SESSION_STATE_TYPES>((set, get) => ({
    // ---- Initial States -----
    session_status: "idle",
    is_mic_muted: false,
    is_session_paused: false,

    // ----- Actions ------

    start_dailing: () => set({ session_status: "dialing" }),

    start_session: async () => {
        const timer = useSessionTimer.getState();

        timer.reset_timer();
        timer.start_timer();
        set({ session_status: "active" });
    },

    end_session: () => {
        useChat.getState().clear_all_messages();
        const keyboard = useKeyboard.getState();

        keyboard.disable_keyboard();
        set({
            session_status: "idle",
            is_mic_muted: false,
            is_session_paused: false,
        });
    },

    toggle_session_pause: () => {
        const keyboard = useKeyboard.getState();
        const timer = useSessionTimer.getState();
        const { is_session_paused } = get();

        if (!is_session_paused) {
            set({ is_session_paused: true });
            keyboard.disable_keyboard();
            timer.stop_timer();
        } else {
            keyboard.enable_keyboard();
            timer.start_timer();
            set({ is_session_paused: false });
        }
    },

    toggle_mute: () => set((state) => ({ is_mic_muted: !state.is_mic_muted })),
}));
