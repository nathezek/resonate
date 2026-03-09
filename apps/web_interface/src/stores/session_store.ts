import { create } from "zustand";

type SESSION_STATE_TYPES = {
    has_session_started: boolean;
    start_session: () => Promise<void>;
    end_session: () => void;
};

export const useSession = create<SESSION_STATE_TYPES>((set) => ({
    has_session_started: false,
    start_session: async () => set({ has_session_started: true }),
    end_session: () => set({ has_session_started: false }),
}));
