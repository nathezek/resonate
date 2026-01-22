import { create } from "zustand";

interface SessionTimeState {
    seconds: number;
    isRunning: boolean;
    increment: () => void;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    getFormattedTime: () => string;
}

export const useSessionTimeStore = create<SessionTimeState>((set, get) => ({
    seconds: 0,
    isRunning: false,

    increment: () => set((state) => ({ seconds: state.seconds + 1 })),

    startTimer: () => set({ isRunning: true }),

    stopTimer: () => set({ isRunning: false }),

    resetTimer: () => set({ seconds: 0, isRunning: false }),

    getFormattedTime: () => {
        const { seconds } = get();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },
}));
