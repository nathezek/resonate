import { create } from "zustand";
import { useChat } from "./chat_store";
import { useKeyboard } from "./keyboard_store";
import { useSessionTimer } from "./session_timer_store";
import { useAudio } from "./audio_store";

type SESSION_STATE_TYPES = {
    // States
    session_status: "idle" | "dialing" | "active";
    is_mic_muted: boolean;
    is_session_paused: boolean;
    is_voice_mode_enabled: boolean;

    // Actions
    start_dailing: () => void;
    start_session: () => Promise<void>;
    end_session: () => void;
    toggle_mute: () => void;
    toggle_session_pause: () => void;
    set_voice_mode: (enabled: boolean) => void;
};

export const useSession = create<SESSION_STATE_TYPES>((set, get) => ({
    // ---- Initial States -----
    session_status: "idle",
    is_mic_muted: false,
    is_session_paused: false,
    is_voice_mode_enabled: true,

    // ----- Actions ------

    start_dailing: () => set({ session_status: "dialing" }),

    start_session: async () => {
        const timer = useSessionTimer.getState();

        timer.reset_timer();
        timer.start_timer();
        set({ session_status: "active", is_voice_mode_enabled: true });

        if (get().is_voice_mode_enabled) {
            useAudio.getState().startListening();
        }
    },

    end_session: () => {
        useChat.getState().clear_all_messages();
        const keyboard = useKeyboard.getState();

        keyboard.disable_keyboard();
        useAudio.getState().resetAll();
        
        set({
            session_status: "idle",
            is_mic_muted: false,
            is_session_paused: false,
            is_voice_mode_enabled: true,
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
            // On pause, reset audio per requirements
            useAudio.getState().resetAll();
        } else {
            keyboard.enable_keyboard();
            timer.start_timer();
            set({ is_session_paused: false });
            // If we are in voice mode, we should probably start listening again
            if (get().is_voice_mode_enabled) {
                useAudio.getState().startListening();
            }
        }
    },

    toggle_mute: () => set((state) => ({ is_mic_muted: !state.is_mic_muted })),
    set_voice_mode: (enabled) => set({ is_voice_mode_enabled: enabled }),
}));
