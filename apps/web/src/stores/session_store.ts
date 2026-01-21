import { create } from "zustand";
import { useAudioStore } from "./audio_store.ts";

export interface SessionState {
    isActive: boolean;
    isPaused: boolean;
    wasMutedBeforePause: boolean; // Memory flag
    startSession: () => void;
    togglePause: () => void;
    endSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    isActive: false,
    isPaused: false,
    wasMutedBeforePause: false,

    startSession: () => {
        const audio = useAudioStore.getState();
        audio.turnMicOn();
        set({ isActive: true, isPaused: false, wasMutedBeforePause: false });
    },

    togglePause: () => {
        const audio = useAudioStore.getState();
        const { isPaused, wasMutedBeforePause } = get();

        if (!isPaused) {
            // --- ACTION: PAUSING ---
            // Save the current mic state before we force it off
            const currentMicMuted = !audio.micEnabled;
            set({ wasMutedBeforePause: currentMicMuted, isPaused: true });
            audio.turnMicOff();
        } else {
            // --- ACTION: RESUMING ---
            // Only turn mic back on if the user HAD it on before pausing
            if (!wasMutedBeforePause) {
                audio.toggleMic(); // This turns it back on
            }
            set({ isPaused: false });
        }
    },

    endSession: () => {
        const audio = useAudioStore.getState();
        audio.turnMicOff();
        // Reset everything to initial state
        set({
            isActive: false,
            isPaused: false,
            wasMutedBeforePause: false,
        });
    },
}));
