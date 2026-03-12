import { create } from "zustand";

type SESSION_TIME_TYPES = {
    seconds: number;
    is_running: boolean;
    increment: () => void;
    start_timer: () => void;
    stop_timer: () => void;
    reset_timer: () => void;
    get_formatted_time: () => string;
};

export const useSessionTimer = create<SESSION_TIME_TYPES>((set, get) => ({
    seconds: 0,
    is_running: false,

    increment: () => set((state) => ({ seconds: state.seconds + 1 })),

    start_timer: () => set({ is_running: true }),

    stop_timer: () => set({ is_running: false }),

    reset_timer: () => set({ seconds: 0, is_running: false }),

    get_formatted_time: () => {
        const { seconds } = get();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },
}));
