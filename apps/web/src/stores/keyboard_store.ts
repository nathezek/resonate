import { create } from "zustand";
import { useAudioStore } from "./audio_store";

export interface KeyboardState {
    keyboardEnabled: boolean;
    toggleKeyboard: () => void;
    disableKeyboard: () => void;
    enableKeyboard: () => void; // Added for explicit control
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
    keyboardEnabled: false,

    toggleKeyboard: () =>
        set((state) => {
            const nextState = !state.keyboardEnabled;

            // If keyboard ON, turn the mic OFF
            if (nextState) {
                useAudioStore.getState().turnMicOff();
            }

            return { keyboardEnabled: nextState };
        }),

    disableKeyboard: () => set({ keyboardEnabled: false }),
    enableKeyboard: () => set({ keyboardEnabled: true }),
}));
