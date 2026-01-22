import { create } from "zustand";
import { useKeyboardStore } from "./keyboard_store";

export interface AudioState {
    micEnabled: boolean;
    toggleMic: () => void;
    turnMicOff: () => void;
    turnMicOn: () => void; // Added to interface
}

export const useAudioStore = create<AudioState>((set) => ({
    micEnabled: false,

    toggleMic: () =>
        set((state) => {
            const nextState = !state.micEnabled;

            // If we are turning the mic ON, turn the keyboard OFF
            if (nextState) {
                useKeyboardStore.getState().disableKeyboard();
            }

            return { micEnabled: nextState };
        }),

    turnMicOff: () => set({ micEnabled: false }),
    turnMicOn: () => set({ micEnabled: true }), // Implementation added
}));
