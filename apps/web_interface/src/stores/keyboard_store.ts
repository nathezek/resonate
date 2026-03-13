import { create } from "zustand";
import { useSession } from "./session_store";
import { useAudio } from "./audio_store";

type KEYBOARD_TYPES = {
    // STATES
    is_keyboard_enabled: boolean;
    was_mic_enabled_before_keyboard: boolean;

    // ACTIONS
    enable_keyboard: () => void;
    disable_keyboard: () => void;
    toggle_keyboard: () => void;
};

export const useKeyboard = create<KEYBOARD_TYPES>((set) => ({
    is_keyboard_enabled: false,
    was_mic_enabled_before_keyboard: false,

    enable_keyboard: () => set({ is_keyboard_enabled: true }),
    disable_keyboard: () => set({ is_keyboard_enabled: false }),
    toggle_keyboard: () =>
        set((state) => {
            const next_state = !state.is_keyboard_enabled;
            const session = useSession.getState();
            const audio = useAudio.getState();

            if (next_state) {
                // Keyboard turning ON - save mic state and turn mic off
                const mic_was_enabled = session.is_voice_mode_enabled;
                session.set_voice_mode(false);
                audio.stopListening();
                return { is_keyboard_enabled: true, was_mic_enabled_before_keyboard: mic_was_enabled };
            } else {
                // Keyboard turning OFF - restore mic if it was on before
                if (state.was_mic_enabled_before_keyboard) {
                    session.set_voice_mode(true);
                    audio.startListening();
                }
                return { is_keyboard_enabled: false };
            }
        }),
}));
