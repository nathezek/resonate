import { create } from "zustand";

export interface AudioState {
    micEnabled: boolean;
    toggleMic: () => void;
    turnMicOff: () => void;
    turnMicOn: () => void; // Added for explicit control
}

export const useAudioStore = create<AudioState>((set) => ({
    micEnabled: false,

    toggleMic: () => set((state) => ({ micEnabled: !state.micEnabled })),

    turnMicOff: () => set({ micEnabled: false }),

    turnMicOn: () => set({ micEnabled: true }),
}));
