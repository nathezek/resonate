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
    was_muted_before_pause: boolean;

    // Actions
    start_dailing: () => void;
    start_session: () => Promise<void>;
    end_session: () => void;
    toggle_mute: () => void;
    toggle_session_pause: () => void;
    set_voice_mode: (enabled: boolean) => void;
    toggle_voice_mode: () => void;
};

export const useSession = create<SESSION_STATE_TYPES>((set, get) => ({
    // ---- Initial States -----
    session_status: "idle",
    is_mic_muted: false,
    is_session_paused: false,
    is_voice_mode_enabled: true,
    was_muted_before_pause: false,

    // ----- Actions ------

    start_dailing: () => set({ session_status: "dialing" }),

    start_session: async () => {
        const timer = useSessionTimer.getState();
        const keyboard = useKeyboard.getState();
        const audio = useAudio.getState();

        timer.reset_timer();
        timer.start_timer();
        
        keyboard.disable_keyboard();
        audio.startListening();

        set({ 
            session_status: "active", 
            is_voice_mode_enabled: true,
            is_session_paused: false,
            was_muted_before_pause: false
        });
    },

    end_session: () => {
        useChat.getState().clear_all_messages();
        const keyboard = useKeyboard.getState();
        const audio = useAudio.getState();
        const timer = useSessionTimer.getState();

        audio.resetAll();
        keyboard.disable_keyboard();
        timer.stop_timer();
        timer.reset_timer();
        
        set({
            session_status: "idle",
            is_mic_muted: false,
            is_session_paused: false,
            is_voice_mode_enabled: true,
            was_muted_before_pause: false,
        });
    },

    toggle_session_pause: () => {
        const audio = useAudio.getState();
        const timer = useSessionTimer.getState();
        const { is_session_paused, is_voice_mode_enabled } = get();

        if (!is_session_paused) {
            // --- ACTION: PAUSING ---
            const current_mic_muted = !is_voice_mode_enabled;
            set({ was_muted_before_pause: current_mic_muted, is_session_paused: true });
            audio.stopListening();
            audio.stopAgentAudio(); // Also kill any TTS playing
            timer.stop_timer();
        } else {
            // --- ACTION: RESUMING ---
            const keyboard = useKeyboard.getState();
            const was_muted = get().was_muted_before_pause;

            // Reset any orphaned agent-pause flag before restarting mic
            useAudio.setState({ isPausedByAgent: false });

            if (!was_muted && !keyboard.is_keyboard_enabled) {
                audio.startListening();
                set({ is_voice_mode_enabled: true }); // Sync UI
            }
            timer.start_timer();
            set({ is_session_paused: false });
        }
    },

    toggle_voice_mode: () => {
        const audio = useAudio.getState();
        const keyboard = useKeyboard.getState();
        const next_state = !get().is_voice_mode_enabled;

        if (next_state) {
            // Turning ON
            keyboard.disable_keyboard();
            audio.startListening();
        } else {
            // Turning OFF
            audio.stopListening();
        }
        set({ is_voice_mode_enabled: next_state });
    },

    toggle_mute: () => set((state) => ({ is_mic_muted: !state.is_mic_muted })),
    set_voice_mode: (enabled) => set({ is_voice_mode_enabled: enabled }),
}));
