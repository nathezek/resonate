import { create } from "zustand";
import { useAudioStore } from "./audio_store";

export interface KeyboardState {
    keyboardEnabled: boolean;
    wasMicEnabledBeforeKeyboard: boolean;
    toggleKeyboard: () => void;
    disableKeyboard: () => void;
    enableKeyboard: () => void; // Added for explicit control
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
    keyboardEnabled: false,
    wasMicEnabledBeforeKeyboard: false,

    toggleKeyboard: () =>
        set((state) => {
            const nextState = !state.keyboardEnabled;
            const audioStore = useAudioStore.getState();

            if (nextState) {
                // Keyboard turning ON - save mic state and turn mic off
                const micWasEnabled = audioStore.micEnabled;
                audioStore.turnMicOff();
                return { keyboardEnabled: true, wasMicEnabledBeforeKeyboard: micWasEnabled };
            } else {
                // Keyboard turning OFF - restore mic if it was on before
                if (state.wasMicEnabledBeforeKeyboard) {
                    audioStore.turnMicOn();
                }
                return { keyboardEnabled: false };
            }
        }),

    disableKeyboard: () => set({ keyboardEnabled: false }),
    enableKeyboard: () => set({ keyboardEnabled: true }),
}));
